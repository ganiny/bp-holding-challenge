import { z } from "zod";

const optionalText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

export const productStatusValues = ["draft", "published", "archived"] as const;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).max(120).regex(slugRegex, "invalid_slug"),
  name_en: z.string().min(2).max(200),
  name_ar: z.string().min(2).max(200),
  description_en: optionalText.pipe(z.union([z.string().max(4000), z.null()])),
  description_ar: optionalText.pipe(z.union([z.string().max(4000), z.null()])),
  category_en: optionalText.pipe(z.union([z.string().max(120), z.null()])),
  category_ar: optionalText.pipe(z.union([z.string().max(120), z.null()])),
  price_sar: z.coerce.number().min(0).max(1_000_000),
  compare_at_sar: z
    .union([z.coerce.number().min(0).max(1_000_000), z.null()])
    .optional()
    .transform((v) => (v === undefined ? null : v)),
  stock: z.coerce.number().int().min(0).max(1_000_000),
  cover_image_path: optionalText.pipe(z.union([z.string().max(500), z.null()])),
  gallery_paths: z.array(z.string().min(1).max(500)).max(12).default([]),
  status: z.enum(productStatusValues),
  is_featured: z.boolean().default(false),
  sort_order: z.coerce.number().int().min(0).max(10_000).default(0),
});

export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;

export const productDeleteSchema = z.object({ id: z.string().uuid() });
