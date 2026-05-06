import { z } from "zod";

/**
 * site_content is a JSONB CMS keyed by short identifier.
 * Each section has its own schema — admins edit one key at a time
 * and we validate the JSON shape per key before persisting.
 */

export const siteContentKeyValues = [
  "home.hero",
  "home.cta",
  "about.timeline",
  "footer",
  "contact",
] as const;
export type SiteContentKey = (typeof siteContentKeyValues)[number];

const trimmedString = (max: number) =>
  z
    .string()
    .max(max)
    .transform((v) => v.trim());

const optionalTrimmed = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null))
    .pipe(z.union([z.string().max(max), z.null()]));

// ── home.hero ──────────────────────────────────────────────────────────────
export const homeHeroSchema = z.object({
  eyebrow_en: optionalTrimmed(120),
  eyebrow_ar: optionalTrimmed(120),
  title_en: trimmedString(200),
  title_ar: trimmedString(200),
  subtitle_en: optionalTrimmed(500),
  subtitle_ar: optionalTrimmed(500),
  cta_primary_label_en: optionalTrimmed(80),
  cta_primary_label_ar: optionalTrimmed(80),
  cta_primary_href: optionalTrimmed(200),
  cta_secondary_label_en: optionalTrimmed(80),
  cta_secondary_label_ar: optionalTrimmed(80),
  cta_secondary_href: optionalTrimmed(200),
  slider_images: z
    .array(
      z.object({
        file_path: z.string().min(1).max(500),
        alt_en: optionalTrimmed(200),
        alt_ar: optionalTrimmed(200),
      }),
    )
    .max(12),
});
export type HomeHero = z.infer<typeof homeHeroSchema>;

// ── home.cta ───────────────────────────────────────────────────────────────
export const homeCtaSchema = z.object({
  title_en: trimmedString(200),
  title_ar: trimmedString(200),
  subtitle_en: optionalTrimmed(500),
  subtitle_ar: optionalTrimmed(500),
  button_label_en: trimmedString(80),
  button_label_ar: trimmedString(80),
  button_href: optionalTrimmed(200),
});
export type HomeCta = z.infer<typeof homeCtaSchema>;

// ── about.timeline ─────────────────────────────────────────────────────────
export const aboutTimelineSchema = z.object({
  entries: z
    .array(
      z.object({
        year: z.string().min(1).max(20),
        heading_en: trimmedString(200),
        heading_ar: trimmedString(200),
        body_en: optionalTrimmed(2000),
        body_ar: optionalTrimmed(2000),
      }),
    )
    .max(40),
});
export type AboutTimeline = z.infer<typeof aboutTimelineSchema>;

// ── footer ─────────────────────────────────────────────────────────────────
export const footerSchema = z.object({
  tagline_en: optionalTrimmed(300),
  tagline_ar: optionalTrimmed(300),
  socials: z.object({
    linkedin: optionalTrimmed(300),
    twitter: optionalTrimmed(300),
    facebook: optionalTrimmed(300),
    instagram: optionalTrimmed(300),
    youtube: optionalTrimmed(300),
  }),
});
export type Footer = z.infer<typeof footerSchema>;

// ── contact ────────────────────────────────────────────────────────────────
export const contactSchema = z.object({
  hq_address_en: optionalTrimmed(300),
  hq_address_ar: optionalTrimmed(300),
  hq_phone: optionalTrimmed(80),
  branch_address_en: optionalTrimmed(300),
  branch_address_ar: optionalTrimmed(300),
  branch_phone: optionalTrimmed(80),
  email: optionalTrimmed(160),
  hours_en: optionalTrimmed(200),
  hours_ar: optionalTrimmed(200),
});
export type Contact = z.infer<typeof contactSchema>;

// ── envelope: a single save request ────────────────────────────────────────
export const siteContentSaveSchema = z.discriminatedUnion("key", [
  z.object({ key: z.literal("home.hero"), data: homeHeroSchema }),
  z.object({ key: z.literal("home.cta"), data: homeCtaSchema }),
  z.object({ key: z.literal("about.timeline"), data: aboutTimelineSchema }),
  z.object({ key: z.literal("footer"), data: footerSchema }),
  z.object({ key: z.literal("contact"), data: contactSchema }),
]);
export type SiteContentSavePayload = z.infer<typeof siteContentSaveSchema>;

// Default values used when a key has not been saved yet.
export const siteContentDefaults: {
  "home.hero": HomeHero;
  "home.cta": HomeCta;
  "about.timeline": AboutTimeline;
  footer: Footer;
  contact: Contact;
} = {
  "home.hero": {
    eyebrow_en: null,
    eyebrow_ar: null,
    title_en: "",
    title_ar: "",
    subtitle_en: null,
    subtitle_ar: null,
    cta_primary_label_en: null,
    cta_primary_label_ar: null,
    cta_primary_href: null,
    cta_secondary_label_en: null,
    cta_secondary_label_ar: null,
    cta_secondary_href: null,
    slider_images: [],
  },
  "home.cta": {
    title_en: "",
    title_ar: "",
    subtitle_en: null,
    subtitle_ar: null,
    button_label_en: "",
    button_label_ar: "",
    button_href: null,
  },
  "about.timeline": { entries: [] },
  footer: {
    tagline_en: null,
    tagline_ar: null,
    socials: {
      linkedin: null,
      twitter: null,
      facebook: null,
      instagram: null,
      youtube: null,
    },
  },
  contact: {
    hq_address_en: null,
    hq_address_ar: null,
    hq_phone: null,
    branch_address_en: null,
    branch_address_ar: null,
    branch_phone: null,
    email: null,
    hours_en: null,
    hours_ar: null,
  },
};
