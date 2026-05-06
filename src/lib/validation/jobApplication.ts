import { z } from "zod";

export const applicationStatusValues = [
  "new",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
] as const;
export type ApplicationStatusValue = (typeof applicationStatusValues)[number];

export const jobApplicationStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(applicationStatusValues),
});

export const jobApplicationNotesSchema = z.object({
  id: z.string().uuid(),
  notes: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
});

export const jobApplicationDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const jobApplicationCvSchema = z.object({
  id: z.string().uuid(),
});
