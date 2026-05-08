"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  adminProfileUpdateSchema,
  adminPasswordChangeSchema,
} from "@/lib/validation/adminProfile";

type Result =
  | { ok: true }
  | {
      ok: false;
      code:
        | "unauthorized"
        | "validation"
        | "invalid_current"
        | "server_error";
      field?: string;
      reason?: string;
    };

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const profile = row as { role: "admin" | "employee" | "member" } | null;
  if (profile?.role !== "admin") return null;
  return { supabase, user };
}

export async function updateAdminProfile(
  raw: unknown,
  locale: string,
): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "unauthorized" };

  const parsed = adminProfileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      reason: parsed.error.issues[0]?.message,
    };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      avatar_url: parsed.data.avatar_url,
    })
    .eq("id", session.user.id);
  if (error) {
    console.error("[admin/settings] profile update failed", error);
    return { ok: false, code: "server_error" };
  }

  const safe = locale === "en" ? "en" : "ar";
  revalidatePath(`/${safe}/admin/settings`);
  // The shell shows the admin's name/avatar — refresh the layout too.
  revalidatePath(`/${safe}/admin`, "layout");
  return { ok: true };
}

export async function changeAdminPassword(
  raw: unknown,
): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "unauthorized" };

  const parsed = adminPasswordChangeSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      code: "validation",
      field: issue?.path.join("."),
      reason: issue?.message,
    };
  }
  const data = parsed.data;

  const { error: reauthErr } = await session.supabase.auth.signInWithPassword({
    email: session.user.email!,
    password: data.currentPassword,
  });
  if (reauthErr) {
    return { ok: false, code: "invalid_current" };
  }

  const { error: updateErr } = await session.supabase.auth.updateUser({
    password: data.newPassword,
  });
  if (updateErr) {
    console.error("[admin/settings] updateUser failed", updateErr);
    return { ok: false, code: "server_error" };
  }

  // Belt-and-braces: clear any lingering must_change_password flag.
  const admin = createSupabaseAdminClient();
  await admin
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", session.user.id);

  return { ok: true };
}
