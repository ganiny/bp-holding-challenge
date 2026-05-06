import { z } from "zod";

export const rfqStatusValues = [
  "new",
  "in_progress",
  "quoted",
  "won",
  "lost",
  "closed",
] as const;
export type RfqStatusValue = (typeof rfqStatusValues)[number];

export const rfqStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(rfqStatusValues),
});

export const rfqNotesSchema = z.object({
  id: z.string().uuid(),
  notes: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
});

export const rfqDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const rfqAttachmentSchema = z.object({
  id: z.string().uuid(),
  index: z.coerce.number().int().min(0).max(50),
});

export const rfqReplySchema = z.object({
  id: z.string().uuid(),
  subject: z.string().min(2).max(200),
  body: z.string().min(2).max(5000),
});
