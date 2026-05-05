import { z } from "zod";

const optionalUrl = z
  .union([z.string().url(), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v ? v : null));

const optionalText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

const optionalInt = z
  .union([z.number().int().min(0).max(120), z.null()])
  .optional()
  .transform((v) => (typeof v === "number" ? v : null));

export const contractorApplicationSchema = z.object({
  companyName: z.string().min(2).max(160),
  contactName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(5).max(40),
  country: optionalText.pipe(z.union([z.string().max(80), z.null()])),
  city: optionalText.pipe(z.union([z.string().max(80), z.null()])),
  crNumber: optionalText.pipe(z.union([z.string().max(40), z.null()])),
  vatNumber: optionalText.pipe(z.union([z.string().max(40), z.null()])),
  specialtyEn: optionalText.pipe(z.union([z.string().max(200), z.null()])),
  specialtyAr: optionalText.pipe(z.union([z.string().max(200), z.null()])),
  yearsExperience: optionalInt,
  website: optionalUrl,
  documentPaths: z.array(z.string().min(1).max(500)).max(10),
  notes: optionalText.pipe(z.union([z.string().max(4000), z.null()])),
  locale: z.enum(["ar", "en"]),
});

export type ContractorApplicationInput = z.infer<typeof contractorApplicationSchema>;
