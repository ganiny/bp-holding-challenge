"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  studioCreateSchema,
  studioUpdateSchema,
  studioReorderSchema,
  studioDeleteSchema,
} from "@/lib/validation/studio";

type Result<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; code: "unauthorized" | "validation" | "server_error"; reason?: string };

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
  revalidatePath(`/${safe}/admin/portfolio-studio`);
  revalidatePath(`/${safe}/portfolio-studio`);
}

export async function createStudioItems(
  raw: unknown,
  locale: string,
): Promise<Result<{ inserted: number }>> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = studioCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "validation", reason: parsed.error.issues[0]?.message };
  }
  const input = parsed.data;
  const admin = createSupabaseAdminClient();

  const { data: maxRow } = await admin
    .from("media_studio")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const startOrder =
    ((maxRow as unknown as { sort_order: number } | null)?.sort_order ?? -1) + 1;

  const rows = input.items.map((it, idx) => ({
    kind: it.kind,
    file_path: it.file_path,
    thumbnail_path: it.thumbnail_path ?? null,
    tags: input.tags,
    visibility: input.visibility,
    sort_order: startOrder + idx,
    caption_en: null,
    caption_ar: null,
  }));

  const { error } = await admin.from("media_studio").insert(rows);
  if (error) {
    console.error("[admin/studio] insert failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true, data: { inserted: rows.length } };
}

export async function updateStudioItem(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = studioUpdateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };
  const input = parsed.data;

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("media_studio")
    .update({
      caption_en: input.caption_en,
      caption_ar: input.caption_ar,
      tags: input.tags,
      visibility: input.visibility,
    })
    .eq("id", input.id);
  if (error) {
    console.error("[admin/studio] update failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function reorderStudio(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = studioReorderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  // Sequential updates — small data, simple to reason about.
  for (let i = 0; i < parsed.data.order.length; i += 1) {
    const id = parsed.data.order[i];
    const { error } = await admin
      .from("media_studio")
      .update({ sort_order: i })
      .eq("id", id);
    if (error) {
      console.error("[admin/studio] reorder failed", error);
      return { ok: false, code: "server_error" };
    }
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function deleteStudioItem(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = studioDeleteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("media_studio").delete().eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/studio] delete failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}
