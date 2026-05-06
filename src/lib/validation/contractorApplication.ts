import { z } from "zod";

export const contractorStatusValues = [
  "new",
  "reviewing",
  "approved",
  "rejected",
] as const;
export type ContractorStatusValue = (typeof contractorStatusValues)[number];

export const contractorStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(contractorStatusValues),
});

export const contractorNotesSchema = z.object({
  id: z.string().uuid(),
  notes: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
});

export const contractorDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const contractorDocumentSchema = z.object({
  id: z.string().uuid(),
  index: z.coerce.number().int().min(0).max(50),
});
