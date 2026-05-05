import { z } from "zod";

const optionalText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

const optionalDate = z
  .union([z.string(), z.literal(""), z.null()])
  .optional()
  .transform((v) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : v;
  });

export const budgetRangeValues = [
  "under_100k",
  "100k_500k",
  "500k_1m",
  "1m_5m",
  "over_5m",
  "unspecified",
] as const;

export const rfqSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(5).max(40),
  company: optionalText.pipe(z.union([z.string().max(160), z.null()])),
  projectType: optionalText.pipe(z.union([z.string().max(160), z.null()])),
  budget: z.enum(budgetRangeValues),
  location: optionalText.pipe(z.union([z.string().max(160), z.null()])),
  startDate: optionalDate,
  description: z.string().min(20).max(4000),
  attachmentPaths: z.array(z.string().min(1).max(500)).max(8),
  locale: z.enum(["ar", "en"]),
});

export type RfqInput = z.infer<typeof rfqSchema>;
