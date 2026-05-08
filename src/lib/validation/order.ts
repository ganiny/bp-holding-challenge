import { z } from "zod";

const optionalText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

export const orderStatusValues = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(5).max(40),
  shippingAddress: z.string().min(5).max(500),
  city: optionalText.pipe(z.union([z.string().max(120), z.null()])),
  notes: optionalText.pipe(z.union([z.string().max(1000), z.null()])),
  items: z.array(checkoutItemSchema).min(1).max(30),
  locale: z.enum(["ar", "en"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const orderStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(orderStatusValues),
});
