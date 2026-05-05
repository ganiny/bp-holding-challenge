"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { changePasswordSchema } from "@/lib/validation/auth";

export type ChangePasswordResult =
  | { ok: false; code: "validation" | "invalid_current" | "server_error" | "not_authenticated"; field?: string; reason?: string };

export async function changePassword(raw: unknown): Promise<ChangePasswordResult> {
  const parsed = changePasswordSchema.safeParse(raw);
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

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "not_authenticated" };
  }

  const { error: reauthErr } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: data.currentPassword,
  });
  if (reauthErr) {
    return { ok: false, code: "invalid_current" };
  }

  const { error: updateErr } = await supabase.auth.updateUser({
    password: data.newPassword,
  });
  if (updateErr) {
    console.error("[change-password] updateUser failed", updateErr);
    return { ok: false, code: "server_error" };
  }

  // Clear must_change_password via service role (RLS allows the user to update
  // their own profile, but going through admin client avoids any policy edge cases).
  const adminClient = createSupabaseAdminClient();
  await adminClient
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", user.id);

  type RoleLookup = { role: "admin" | "employee" | "member" };
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRow as RoleLookup | null;
  const role = profile?.role ?? "employee";

  const dest =
    role === "admin"
      ? `/${data.locale}/admin`
      : role === "employee"
        ? `/${data.locale}/employee`
        : `/${data.locale}`;
  redirect(dest);
}
