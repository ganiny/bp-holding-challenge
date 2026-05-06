"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  careerUpsertSchema,
  careerStatusSchema,
  careerDeleteSchema,
} from "@/lib/validation/career";

type Result<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; code: "unauthorized" | "validation" | "conflict" | "server_error"; reason?: string };

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

function revalidateAll(locale: string) {
  const safe = locale === "en" ? "en" : "ar";
  revalidatePath(`/${safe}/admin/careers`);
  revalidatePath(`/${safe}/careers`);
}

export async function upsertCareer(
  raw: unknown,
  locale: string,
): Promise<Result<{ id: string }>> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = careerUpsertSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "validation", reason: parsed.error.issues[0]?.message };
  }
  const input = parsed.data;
  const admin = createSupabaseAdminClient();

  const slugConflictQuery = admin
    .from("careers")
    .select("id")
    .eq("slug", input.slug);
  if (input.id) slugConflictQuery.neq("id", input.id);
  const { data: conflictRow } = await slugConflictQuery.maybeSingle();
  if (conflictRow) {
    return { ok: false, code: "conflict", reason: "slug" };
  }

  const payload = {
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    department_en: input.department_en,
    department_ar: input.department_ar,
    location_en: input.location_en,
    location_ar: input.location_ar,
    type_en: input.type_en,
    type_ar: input.type_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    requirements_en: input.requirements_en,
    requirements_ar: input.requirements_ar,
    status: input.status,
    closes_at: input.closes_at,
  };

  let careerId: string;
  if (input.id) {
    const { error } = await admin.from("careers").update(payload).eq("id", input.id);
    if (error) {
      console.error("[admin/careers] update failed", error);
      return { ok: false, code: "server_error" };
    }
    careerId = input.id;
  } else {
    type Inserted = { id: string };
    const { data, error } = await admin
      .from("careers")
      .insert(payload)
      .select("id")
      .single();
    if (error || !data) {
      console.error("[admin/careers] insert failed", error);
      return { ok: false, code: "server_error" };
    }
    careerId = (data as unknown as Inserted).id;
  }

  revalidateAll(locale);
  return { ok: true, data: { id: careerId } };
}

export async function setCareerStatus(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = careerStatusSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("careers")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/careers] status update failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function deleteCareer(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = careerDeleteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("careers").delete().eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/careers] delete failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}
