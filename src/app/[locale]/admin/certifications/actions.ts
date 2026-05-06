"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSignedUrl } from "@/lib/imagekit/server";
import {
  certificationUpsertSchema,
  certificationVisibilitySchema,
  certificationReorderSchema,
  certificationDeleteSchema,
  certificationFileSchema,
} from "@/lib/validation/certification";

type Result<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | {
      ok: false;
      code: "unauthorized" | "validation" | "not_found" | "server_error";
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
  return user;
}

function revalidateAll(locale: string) {
  const safe = locale === "en" ? "en" : "ar";
  revalidatePath(`/${safe}/admin/certifications`);
  revalidatePath(`/${safe}/certifications`);
}

export async function upsertCertification(
  raw: unknown,
  locale: string,
): Promise<Result<{ id: string }>> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = certificationUpsertSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "validation", reason: parsed.error.issues[0]?.message };
  }
  const input = parsed.data;
  const admin = createSupabaseAdminClient();

  const payload = {
    title_en: input.title_en,
    title_ar: input.title_ar,
    issuer_en: input.issuer_en,
    issuer_ar: input.issuer_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    file_path: input.file_path,
    thumbnail_path: input.thumbnail_path,
    visibility: input.visibility,
    issued_on: input.issued_on,
    expires_on: input.expires_on,
    sort_order: input.sort_order,
  };

  let certId: string;
  if (input.id) {
    const { error } = await admin
      .from("certifications")
      .update(payload)
      .eq("id", input.id);
    if (error) {
      console.error("[admin/certifications] update failed", error);
      return { ok: false, code: "server_error" };
    }
    certId = input.id;
  } else {
    type Inserted = { id: string };
    const { data, error } = await admin
      .from("certifications")
      .insert(payload)
      .select("id")
      .single();
    if (error || !data) {
      console.error("[admin/certifications] insert failed", error);
      return { ok: false, code: "server_error" };
    }
    certId = (data as unknown as Inserted).id;
  }

  revalidateAll(locale);
  return { ok: true, data: { id: certId } };
}

export async function setCertificationVisibility(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = certificationVisibilitySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("certifications")
    .update({ visibility: parsed.data.visibility })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/certifications] visibility update failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function reorderCertifications(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = certificationReorderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  for (let i = 0; i < parsed.data.order.length; i += 1) {
    const id = parsed.data.order[i];
    const { error } = await admin
      .from("certifications")
      .update({ sort_order: i })
      .eq("id", id);
    if (error) {
      console.error("[admin/certifications] reorder failed", error);
      return { ok: false, code: "server_error" };
    }
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function deleteCertification(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = certificationDeleteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("certifications")
    .delete()
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/certifications] delete failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

/**
 * Issues a short-lived signed URL for a private-folder certificate file.
 * Public certificates render via the public ImageKit URL — this is only
 * used when visibility is 'private' (e.g. internal-only audit certificates).
 */
export async function getCertificationFileUrl(
  raw: unknown,
): Promise<Result<{ url: string; filePath: string }>> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = certificationFileSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { data: row } = await admin
    .from("certifications")
    .select("file_path")
    .eq("id", parsed.data.id)
    .maybeSingle();
  const found = row as { file_path: string | null } | null;
  if (!found?.file_path) return { ok: false, code: "not_found" };

  try {
    const url = getSignedUrl(found.file_path, 300);
    return { ok: true, data: { url, filePath: found.file_path } };
  } catch (e) {
    console.error("[admin/certifications] sign file failed", e);
    return { ok: false, code: "server_error" };
  }
}
