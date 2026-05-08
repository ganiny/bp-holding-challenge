import { z } from "zod";

export const mediaKindValues = ["image", "video", "document"] as const;
export type MediaKindValue = (typeof mediaKindValues)[number];

export const mediaVisibilityValues = ["public", "private"] as const;
export type MediaVisibilityValue = (typeof mediaVisibilityValues)[number];

const optionalText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

export const studioCreateSchema = z.object({
  items: z
    .array(
      z.object({
        kind: z.enum(mediaKindValues),
        file_path: z.string().min(1).max(500),
        thumbnail_path: z.string().max(500).optional().nullable(),
        caption_en: optionalText.pipe(z.union([z.string().max(300), z.null()])),
        caption_ar: optionalText.pipe(z.union([z.string().max(300), z.null()])),
      }),
    )
    .min(1)
    .max(40),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  visibility: z.enum(mediaVisibilityValues).default("public"),
});

export const studioUpdateSchema = z.object({
  id: z.string().uuid(),
  caption_en: optionalText.pipe(z.union([z.string().max(300), z.null()])),
  caption_ar: optionalText.pipe(z.union([z.string().max(300), z.null()])),
  tags: z.array(z.string().min(1).max(40)).max(20),
  visibility: z.enum(mediaVisibilityValues),
  // Optional file replacements — only sent when the admin actually swaps assets.
  file_path: z.string().min(1).max(500).optional(),
  thumbnail_path: z
    .union([z.string().max(500), z.null()])
    .optional(),
});

export const studioReorderSchema = z.object({
  order: z.array(z.string().uuid()).min(1).max(500),
});

export const studioDeleteSchema = z.object({
  id: z.string().uuid(),
});
