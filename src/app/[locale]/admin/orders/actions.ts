"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { orderStatusUpdateSchema } from "@/lib/validation/order";

type Result<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | {
      ok: false;
      code: "unauthorized" | "validation" | "server_error";
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
  return user;
}

export async function updateOrderStatus(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = orderStatusUpdateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status: parsed.data.status } as never)
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/orders] status update failed", error);
    return { ok: false, code: "server_error" };
  }

  const safe = locale === "en" ? "en" : "ar";
  revalidatePath(`/${safe}/admin/orders`);
  return { ok: true };
}
