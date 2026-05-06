import { z } from "zod";
import { mediaVisibilityValues } from "./studio";

const optionalText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

const optionalDate = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (!v || v.trim().length === 0) return null;
    // <input type="date"> sends "YYYY-MM-DD" — Postgres date column accepts that directly.
    return v.length === 10 ? v : v.slice(0, 10);
  });

export const certificationUpsertSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title_en: z.string().min(2).max(200),
  title_ar: z.string().min(2).max(200),
  issuer_en: optionalText.pipe(z.union([z.string().max(160), z.null()])),
  issuer_ar: optionalText.pipe(z.union([z.string().max(160), z.null()])),
  description_en: optionalText.pipe(z.union([z.string().max(2000), z.null()])),
  description_ar: optionalText.pipe(z.union([z.string().max(2000), z.null()])),
  file_path: z.string().min(1).max(500),
  thumbnail_path: optionalText.pipe(z.union([z.string().max(500), z.null()])),
  visibility: z.enum(mediaVisibilityValues),
  issued_on: optionalDate.pipe(z.union([z.string(), z.null()])),
  expires_on: optionalDate.pipe(z.union([z.string(), z.null()])),
  sort_order: z.coerce.number().int().min(0).max(10000),
});

export type CertificationUpsertInput = z.infer<
  typeof certificationUpsertSchema
>;

export const certificationVisibilitySchema = z.object({
  id: z.string().uuid(),
  visibility: z.enum(mediaVisibilityValues),
});

export const certificationReorderSchema = z.object({
  order: z.array(z.string().uuid()).min(1).max(500),
});

export const certificationDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const certificationFileSchema = z.object({
  id: z.string().uuid(),
});
