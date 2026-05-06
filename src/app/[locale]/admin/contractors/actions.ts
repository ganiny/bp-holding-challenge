"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSignedUrl } from "@/lib/imagekit/server";
import {
  contractorStatusSchema,
  contractorNotesSchema,
  contractorDeleteSchema,
  contractorDocumentSchema,
} from "@/lib/validation/contractorApplication";

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
  revalidatePath(`/${safe}/admin/contractors`);
  revalidatePath(`/${safe}/admin`);
}

export async function setContractorStatus(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = contractorStatusSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("contractor_applications")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/contractors] status update failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function setContractorNotes(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = contractorNotesSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("contractor_applications")
    .update({ notes: parsed.data.notes })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/contractors] notes update failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function deleteContractor(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = contractorDeleteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("contractor_applications")
    .delete()
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/contractors] delete failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

/**
 * Sign one document by index out of the contractor's document_paths array.
 * Re-fetched on every "open" click so the URL never lives long enough to leak.
 */
export async function getContractorDocumentUrl(
  raw: unknown,
): Promise<Result<{ url: string; filePath: string }>> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = contractorDocumentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { data: row } = await admin
    .from("contractor_applications")
    .select("document_paths")
    .eq("id", parsed.data.id)
    .maybeSingle();
  const found = row as { document_paths: string[] | null } | null;
  const paths = found?.document_paths ?? [];
  const filePath = paths[parsed.data.index];
  if (!filePath) return { ok: false, code: "not_found" };

  try {
    const url = getSignedUrl(filePath, 300);
    return { ok: true, data: { url, filePath } };
  } catch (e) {
    console.error("[admin/contractors] sign document failed", e);
    return { ok: false, code: "server_error" };
  }
}
