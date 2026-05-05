import { z } from "zod";

const optionalText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

export const contactMessageSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: optionalText.pipe(z.union([z.string().min(5).max(40), z.null()])),
  subject: optionalText.pipe(z.union([z.string().max(200), z.null()])),
  message: z.string().min(10).max(4000),
  locale: z.enum(["ar", "en"]),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
