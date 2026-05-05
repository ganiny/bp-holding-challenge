"use client";

import { useState, useTransition } from "react";
import {
  useForm,
  type Resolver,
  type SubmitHandler,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/app/[locale]/(auth)/change-password/actions";
import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";

const formSchema = z
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

type FormValues = z.infer<typeof formSchema>;

export type ChangePasswordCopy = {
  currentPassword: string;
  currentPasswordPlaceholder: string;
  newPassword: string;
  newPasswordPlaceholder: string;
  confirmPassword: string;
  confirmPasswordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  submitting: string;
  ruleMin: string;
  ruleLower: string;
  ruleUpper: string;
  ruleDigit: string;
  errorInvalidCurrent: string;
  errorMismatch: string;
  errorSameAsCurrent: string;
  errorValidation: string;
  errorGeneric: string;
  errorNotAuthenticated: string;
};

export function ChangePasswordForm({
  locale,
  copy,
}: {
  locale: "ar" | "en";
  copy: ChangePasswordCopy;
}) {
  const [reveal, setReveal] = useState({ current: false, next: false, confirm: false });
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: (zodResolver as unknown as (schema: unknown) => Resolver<FormValues>)(
      formSchema,
    ),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    startTransition(async () => {
      const res = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
        locale,
      });

      if (!res) return;

      if (res.code === "invalid_current") {
        toast.error(copy.errorInvalidCurrent);
      } else if (res.code === "validation") {
        const reason = res.reason;
        if (reason === "mismatch") toast.error(copy.errorMismatch);
        else if (reason === "same_as_current") toast.error(copy.errorSameAsCurrent);
        else toast.error(copy.errorValidation);
      } else if (res.code === "not_authenticated") {
        toast.error(copy.errorNotAuthenticated);
      } else {
        toast.error(copy.errorGeneric);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <PasswordField
        id="cp-current"
        label={copy.currentPassword}
        placeholder={copy.currentPasswordPlaceholder}
        autoComplete="current-password"
        reveal={reveal.current}
        onToggle={() => setReveal((r) => ({ ...r, current: !r.current }))}
        showLabel={copy.showPassword}
        hideLabel={copy.hidePassword}
        invalid={!!errors.currentPassword}
        register={register("currentPassword")}
      />

      <PasswordField
        id="cp-new"
        label={copy.newPassword}
        placeholder={copy.newPasswordPlaceholder}
        autoComplete="new-password"
        reveal={reveal.next}
        onToggle={() => setReveal((r) => ({ ...r, next: !r.next }))}
        showLabel={copy.showPassword}
        hideLabel={copy.hidePassword}
        invalid={!!errors.newPassword}
        register={register("newPassword")}
      />

      <ul className="space-y-1 text-xs text-muted-foreground">
        <li>• {copy.ruleMin}</li>
        <li>• {copy.ruleLower}</li>
        <li>• {copy.ruleUpper}</li>
        <li>• {copy.ruleDigit}</li>
      </ul>

      <PasswordField
        id="cp-confirm"
        label={copy.confirmPassword}
        placeholder={copy.confirmPasswordPlaceholder}
        autoComplete="new-password"
        reveal={reveal.confirm}
        onToggle={() => setReveal((r) => ({ ...r, confirm: !r.confirm }))}
        showLabel={copy.showPassword}
        hideLabel={copy.hidePassword}
        invalid={!!errors.confirmPassword}
        register={register("confirmPassword")}
      />

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

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  reveal: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
  invalid: boolean;
  register: UseFormRegisterReturn;
};

function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  reveal,
  onToggle,
  showLabel,
  hideLabel,
  invalid,
  register,
}: PasswordFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative mt-1.5">
        <Input
          id={id}
          type={reveal ? "text" : "password"}
          autoComplete={autoComplete}
          dir="ltr"
          placeholder={placeholder}
          aria-invalid={invalid}
          {...register}
          className="pe-11"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-e-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={reveal ? hideLabel : showLabel}
          tabIndex={-1}
        >
          {reveal ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
