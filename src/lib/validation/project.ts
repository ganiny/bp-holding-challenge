import { z } from "zod";

export const publishStatusValues = ["draft", "published", "archived"] as const;
export type PublishStatusValue = (typeof publishStatusValues)[number];

const optionalText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

const optionalInt = z
  .union([z.coerce.number().int(), z.null()])
  .optional()
  .transform((v) => (typeof v === "number" && Number.isFinite(v) ? v : null));

export const projectUpsertSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "slug" }),
  title_en: z.string().min(2).max(200),
  title_ar: z.string().min(2).max(200),
  summary_en: optionalText.pipe(z.union([z.string().max(500), z.null()])),
  summary_ar: optionalText.pipe(z.union([z.string().max(500), z.null()])),
  description_en: optionalText.pipe(z.union([z.string().max(8000), z.null()])),
  description_ar: optionalText.pipe(z.union([z.string().max(8000), z.null()])),
  sector: optionalText.pipe(z.union([z.string().max(80), z.null()])),
  client: optionalText.pipe(z.union([z.string().max(160), z.null()])),
  location_en: optionalText.pipe(z.union([z.string().max(160), z.null()])),
  location_ar: optionalText.pipe(z.union([z.string().max(160), z.null()])),
  year: optionalInt.pipe(z.union([z.number().int().min(1900).max(2100), z.null()])),
  cover_image_path: optionalText.pipe(z.union([z.string().max(500), z.null()])),
  status: z.enum(publishStatusValues),
  is_featured: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(10000),
  gallery: z
    .array(
      z.object({
        file_path: z.string().min(1).max(500),
        thumbnail_path: z.string().max(500).optional().nullable(),
        caption_en: z.string().max(300).optional().nullable(),
        caption_ar: z.string().max(300).optional().nullable(),
      }),
    )
    .max(40),
});

export type ProjectUpsertInput = z.infer<typeof projectUpsertSchema>;

export const projectStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(publishStatusValues),
});

export const projectDeleteSchema = z.object({
  id: z.string().uuid(),
});
