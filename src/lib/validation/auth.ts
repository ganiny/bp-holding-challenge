import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(8).max(128),
  locale: z.enum(["ar", "en"]),
  next: z.string().max(500).optional().nullable(),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const changePasswordSchema = z
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
    locale: z.enum(["ar", "en"]),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "mismatch",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "same_as_current",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
