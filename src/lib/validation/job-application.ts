import { z } from "zod";

const optionalUrl = z
  .union([z.string().url(), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v ? v : null));

const optionalText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

export const jobApplicationSchema = z.object({
  careerId: z.string().uuid().nullable(),
  careerSlug: z.string().min(1),
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: optionalText.pipe(
    z.union([z.string().min(5).max(40), z.null()]),
  ),
  coverLetter: optionalText.pipe(
    z.union([z.string().max(4000), z.null()]),
  ),
  cvFilePath: z.string().min(1).max(500),
  portfolioUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  locale: z.enum(["ar", "en"]),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
