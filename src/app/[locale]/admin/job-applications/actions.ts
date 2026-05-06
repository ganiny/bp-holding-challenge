"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSignedUrl } from "@/lib/imagekit/server";
import {
  jobApplicationStatusSchema,
  jobApplicationNotesSchema,
  jobApplicationDeleteSchema,
  jobApplicationCvSchema,
} from "@/lib/validation/jobApplication";

type Result<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; code: "unauthorized" | "validation" | "not_found" | "server_error"; reason?: string };

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
  revalidatePath(`/${safe}/admin/job-applications`);
  revalidatePath(`/${safe}/admin`);
}

export async function setApplicationStatus(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = jobApplicationStatusSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("job_applications")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/job-applications] status update failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function setApplicationNotes(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = jobApplicationNotesSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("job_applications")
    .update({ notes: parsed.data.notes })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/job-applications] notes update failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function deleteApplication(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = jobApplicationDeleteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("job_applications")
    .delete()
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/job-applications] delete failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

/**
 * Issues a short-lived signed URL for the applicant's CV (private folder).
 * Re-fetched lazily on every "view CV" click so the URL never lives long
 * enough to leak.
 */
export async function getApplicationCvUrl(
  raw: unknown,
): Promise<Result<{ url: string }>> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = jobApplicationCvSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { data: row } = await admin
    .from("job_applications")
    .select("cv_file_path")
    .eq("id", parsed.data.id)
    .maybeSingle();
  const found = row as { cv_file_path: string | null } | null;
  if (!found?.cv_file_path) {
    return { ok: false, code: "not_found" };
  }

  try {
    const url = getSignedUrl(found.cv_file_path, 300);
    return { ok: true, data: { url } };
  } catch (e) {
    console.error("[admin/job-applications] sign cv failed", e);
    return { ok: false, code: "server_error" };
  }
}
