"use client";

import { useState, useTransition } from "react";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { signIn } from "@/app/[locale]/(auth)/login/actions";
import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";

const formSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(8).max(128),
});

type FormValues = z.infer<typeof formSchema>;

export type LoginFormCopy = {
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  submitting: string;
  errorInvalidCredentials: string;
  errorRateLimited: string;
  errorValidation: string;
  errorGeneric: string;
};

export function LoginForm({
  locale,
  next,
  copy,
}: {
  locale: "ar" | "en";
  next: string | null;
  copy: LoginFormCopy;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: (zodResolver as unknown as (schema: unknown) => Resolver<FormValues>)(
      formSchema,
    ),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    startTransition(async () => {
      const res = await signIn({
        email: values.email,
        password: values.password,
        locale,
        next,
      });

      if (!res) return;

      if (res.code === "invalid_credentials") {
        toast.error(copy.errorInvalidCredentials);
      } else if (res.code === "rate_limited") {
        toast.error(copy.errorRateLimited);
      } else if (res.code === "validation") {
        toast.error(copy.errorValidation);
      } else {
        toast.error(copy.errorGeneric);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="login-email" className="text-sm font-medium">
          {copy.email}
        </Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          dir="ltr"
          placeholder={copy.emailPlaceholder}
          aria-invalid={!!errors.email}
          {...register("email")}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="login-password" className="text-sm font-medium">
          {copy.password}
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            dir="ltr"
            placeholder={copy.passwordPlaceholder}
            aria-invalid={!!errors.password}
            {...register("password")}
            className="pe-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-e-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={showPassword ? copy.hidePassword : copy.showPassword}
            tabIndex={-1}
          >
            {showPassword ? (
              <IconEyeOff className="size-4" />
            ) : (
              <IconEye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full bg-brand-navy text-brand-cream hover:bg-brand-navy-hover"
      >
        {isPending ? (
          <>
            <IconLoader2 className="size-4 animate-spin" />
            {copy.submitting}
          </>
        ) : (
          copy.submit
        )}
      </Button>
    </form>
  );
}
