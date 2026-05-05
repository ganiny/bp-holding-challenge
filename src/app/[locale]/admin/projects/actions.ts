"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  projectUpsertSchema,
  projectStatusSchema,
  projectDeleteSchema,
} from "@/lib/validation/project";

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

function revalidateAll(locale: "ar" | "en" | string) {
  const safeLocale = locale === "en" ? "en" : "ar";
  revalidatePath(`/${safeLocale}/admin/projects`);
  revalidatePath(`/${safeLocale}/portfolio`);
  revalidatePath(`/${safeLocale}`);
}

export async function upsertProject(
  raw: unknown,
  locale: string,
): Promise<Result<{ id: string }>> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = projectUpsertSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "validation", reason: parsed.error.issues[0]?.message };
  }
  const input = parsed.data;
  const admin = createSupabaseAdminClient();

  const slugConflictQuery = admin
    .from("projects")
    .select("id")
    .eq("slug", input.slug);
  if (input.id) slugConflictQuery.neq("id", input.id);
  const { data: conflictRow } = await slugConflictQuery.maybeSingle();
  if (conflictRow) {
    return { ok: false, code: "conflict", reason: "slug" };
  }

  const projectPayload = {
    slug: input.slug,
    title_en: input.title_en,
    title_ar: input.title_ar,
    summary_en: input.summary_en,
    summary_ar: input.summary_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    sector: input.sector,
    client: input.client,
    location_en: input.location_en,
    location_ar: input.location_ar,
    year: input.year,
    cover_image_path: input.cover_image_path,
    status: input.status,
    is_featured: input.is_featured,
    sort_order: input.sort_order,
  };

  let projectId: string;
  if (input.id) {
    const { error } = await admin
      .from("projects")
      .update(projectPayload)
      .eq("id", input.id);
    if (error) {
      console.error("[admin/projects] update failed", error);
      return { ok: false, code: "server_error" };
    }
    projectId = input.id;
  } else {
    type Inserted = { id: string };
    const { data, error } = await admin
      .from("projects")
      .insert(projectPayload)
      .select("id")
      .single();
    if (error || !data) {
      console.error("[admin/projects] insert failed", error);
      return { ok: false, code: "server_error" };
    }
    projectId = (data as unknown as Inserted).id;
  }

  // Replace gallery wholesale — simpler than reconciling deltas, fine for the scale we expect.
  const { error: deleteErr } = await admin
    .from("project_media")
    .delete()
    .eq("project_id", projectId);
  if (deleteErr) {
    console.error("[admin/projects] gallery wipe failed", deleteErr);
    return { ok: false, code: "server_error" };
  }

  if (input.gallery.length > 0) {
    const mediaRows = input.gallery.map((g, idx) => ({
      project_id: projectId,
      kind: "image" as const,
      file_path: g.file_path,
      thumbnail_path: g.thumbnail_path ?? null,
      caption_en: g.caption_en ?? null,
      caption_ar: g.caption_ar ?? null,
      sort_order: idx,
    }));
    const { error: mediaErr } = await admin.from("project_media").insert(mediaRows);
    if (mediaErr) {
      console.error("[admin/projects] gallery insert failed", mediaErr);
      return { ok: false, code: "server_error" };
    }
  }

  revalidateAll(locale);
  return { ok: true, data: { id: projectId } };
}

export async function setProjectStatus(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = projectStatusSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("projects")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/projects] status update failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function deleteProject(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = projectDeleteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("projects").delete().eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/projects] delete failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}
