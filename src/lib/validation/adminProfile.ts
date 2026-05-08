import { z } from "zod";

const optionalText = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null))
    .pipe(z.union([z.string().max(max), z.null()]));

export const adminProfileUpdateSchema = z.object({
  full_name: optionalText(160),
  phone: optionalText(40),
  avatar_url: optionalText(500),
});
export type AdminProfileUpdateInput = z.infer<typeof adminProfileUpdateSchema>;

/**
 * In-app password change (settings page) — same shape as the auth-flow schema
 * but without the `locale` field, since the settings page already runs inside
 * a localized route and we don't redirect on success.
 */
export const adminPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z
      .string()
      .min(10, { message: "min" })
      .max(128)
      .regex(/[a-z]/, { message: "lower" })
      .regex(/[A-Z]/, { message: "upper" })
      .regex(/[0-9]/, { message: "digit" }),
    confirmPassword: z.string().min(10).max(128),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "mismatch",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "same_as_current",
    path: ["newPassword"],
  });
export type AdminPasswordChangeInput = z.infer<
  typeof adminPasswordChangeSchema
>;
