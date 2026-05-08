import { z } from "zod";

export const messageStatusValues = [
  "new",
  "read",
  "replied",
  "closed",
] as const;
export type MessageStatusValue = (typeof messageStatusValues)[number];

export const messageStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(messageStatusValues),
});

export const messageDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const messageReplySchema = z.object({
  id: z.string().uuid(),
  subject: z.string().min(2).max(200),
  body: z.string().min(2).max(5000),
});
