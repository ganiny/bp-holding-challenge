"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  productUpsertSchema,
  productDeleteSchema,
} from "@/lib/validation/product";

type Result<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | {
      ok: false;
      code: "unauthorized" | "validation" | "conflict" | "server_error";
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
  revalidatePath(`/${safe}/admin/products`);
  revalidatePath(`/${safe}/store`);
}

export async function upsertProduct(
  raw: unknown,
  locale: string,
): Promise<Result<{ id: string }>> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = productUpsertSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      reason: parsed.error.issues[0]?.message,
    };
  }
  const input = parsed.data;
  const admin = createSupabaseAdminClient();

  const payload = {
    slug: input.slug,
    name_en: input.name_en,
    name_ar: input.name_ar,
    description_en: input.description_en,
    description_ar: input.description_ar,
    category_en: input.category_en,
    category_ar: input.category_ar,
    price_sar: input.price_sar,
    compare_at_sar: input.compare_at_sar,
    stock: input.stock,
    cover_image_path: input.cover_image_path,
    gallery_paths: input.gallery_paths,
    status: input.status,
    is_featured: input.is_featured,
    sort_order: input.sort_order,
  };

  let id: string;
  if (input.id) {
    const { error } = await admin
      .from("products")
      .update(payload as never)
      .eq("id", input.id);
    if (error) {
      console.error("[admin/products] update failed", error);
      if (error.code === "23505") return { ok: false, code: "conflict" };
      return { ok: false, code: "server_error" };
    }
    id = input.id;
  } else {
    const { data, error } = await admin
      .from("products")
      .insert(payload as never)
      .select("id")
      .single();
    if (error || !data) {
      console.error("[admin/products] insert failed", error);
      if (error?.code === "23505") return { ok: false, code: "conflict" };
      return { ok: false, code: "server_error" };
    }
    id = (data as unknown as { id: string }).id;
  }

  revalidateAll(locale);
  return { ok: true, data: { id } };
}

export async function deleteProduct(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = productDeleteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("products")
    .delete()
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/products] delete failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}
