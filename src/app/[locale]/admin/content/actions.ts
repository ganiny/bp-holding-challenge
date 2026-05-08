"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  siteContentSaveSchema,
  type SiteContentKey,
} from "@/lib/validation/siteContent";

type Result =
  | { ok: true }
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

/**
 * Touched paths depend on the key — change to footer/contact ripples sitewide,
 * home.* only touches the home page, about.timeline only touches /about.
 */
function pathsToRevalidate(locale: string, key: SiteContentKey): string[] {
  const safe = locale === "en" ? "en" : "ar";
  const both = ["en", "ar"];
  switch (key) {
    case "home.hero":
    case "home.cta":
      return both.map((l) => `/${l}`);
    case "about.timeline":
      return both.map((l) => `/${l}/about`);
    case "footer":
    case "contact":
      // Footer renders on every public page, contact has its own page too.
      return [`/${safe}/contact`, ...both.map((l) => `/${l}`)];
  }
}

export async function saveSiteContent(
  raw: unknown,
  locale: string,
): Promise<Result> {
  const user = await requireAdmin();
  if (!user) return { ok: false, code: "unauthorized" };

  const parsed = siteContentSaveSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "validation", reason: parsed.error.issues[0]?.message };
  }

  const admin = createSupabaseAdminClient();
  // Upsert by primary key — insert if new, update otherwise.
  const payload = {
    key: parsed.data.key,
    data: parsed.data.data,
    updated_by: user.id,
  };
  const { error } = await admin
    .from("site_content")
    .upsert(payload as never, { onConflict: "key" });
  if (error) {
    console.error("[admin/content] upsert failed", error);
    return { ok: false, code: "server_error" };
  }

  for (const p of pathsToRevalidate(locale, parsed.data.key)) {
    revalidatePath(p);
  }
  return { ok: true };
}
