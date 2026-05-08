import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  siteContentDefaults,
  type SiteContentKey,
  type HomeHero,
  type HomeCta,
  type AboutTimeline,
  type Footer,
  type Contact,
} from "@/lib/validation/siteContent";

type SnapshotMap = {
  "home.hero": HomeHero;
  "home.cta": HomeCta;
  "about.timeline": AboutTimeline;
  footer: Footer;
  contact: Contact;
};

/**
 * Fetch one site_content block, falling back to the schema default
 * whenever the row is missing or any field is blank.
 *
 * Server-only — call from server components (or server actions). The default
 * fallback means consumers never need to handle a "not yet saved" case.
 */
export async function getSiteContentBlock<K extends SiteContentKey>(
  key: K,
): Promise<SnapshotMap[K]> {
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("site_content")
    .select("data")
    .eq("key", key)
    .maybeSingle();
  const stored = (row as { data: unknown } | null)?.data as
    | Partial<SnapshotMap[K]>
    | null;
  const defaults = siteContentDefaults[key] as SnapshotMap[K];
  if (!stored) return defaults;
  // Shallow merge so missing fields fall back to defaults — the stored JSON
  // is trusted (validated on write) but may pre-date a schema field add.
  return { ...defaults, ...stored } as SnapshotMap[K];
}

/** Pick the locale-specific value, falling back to the other locale and finally the default. */
export function pickLocale(
  locale: "ar" | "en",
  ar: string | null | undefined,
  en: string | null | undefined,
  fallback?: string,
): string {
  const primary = locale === "ar" ? ar : en;
  if (primary && primary.trim()) return primary;
  const secondary = locale === "ar" ? en : ar;
  if (secondary && secondary.trim()) return secondary;
  return fallback ?? "";
}
