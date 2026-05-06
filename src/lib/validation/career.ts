import { z } from "zod";

export const careerStatusValues = ["draft", "open", "closed"] as const;
export type CareerStatusValue = (typeof careerStatusValues)[number];

const optionalText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

const optionalDate = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (!v || v.trim().length === 0) return null;
    // Accept "YYYY-MM-DD" from <input type="date"> or full ISO timestamps.
    const s = v.length === 10 ? `${v}T23:59:59.000Z` : v;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  });

export const careerUpsertSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "slug" }),
  title_en: z.string().min(2).max(200),
  title_ar: z.string().min(2).max(200),
  department_en: optionalText.pipe(z.union([z.string().max(120), z.null()])),
  department_ar: optionalText.pipe(z.union([z.string().max(120), z.null()])),
  location_en: optionalText.pipe(z.union([z.string().max(160), z.null()])),
  location_ar: optionalText.pipe(z.union([z.string().max(160), z.null()])),
  type_en: optionalText.pipe(z.union([z.string().max(80), z.null()])),
  type_ar: optionalText.pipe(z.union([z.string().max(80), z.null()])),
  description_en: optionalText.pipe(z.union([z.string().max(8000), z.null()])),
  description_ar: optionalText.pipe(z.union([z.string().max(8000), z.null()])),
  requirements_en: optionalText.pipe(z.union([z.string().max(8000), z.null()])),
  requirements_ar: optionalText.pipe(z.union([z.string().max(8000), z.null()])),
  status: z.enum(careerStatusValues),
  closes_at: optionalDate.pipe(z.union([z.string(), z.null()])),
});

export type CareerUpsertInput = z.infer<typeof careerUpsertSchema>;

export const careerStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(careerStatusValues),
});

export const careerDeleteSchema = z.object({
  id: z.string().uuid(),
});
