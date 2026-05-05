"use client";

import { useState, useTransition } from "react";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitContactMessage } from "@/app/[locale]/(marketing)/contact/actions";
import { IconCheck } from "@tabler/icons-react";

const formSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(40),
  subject: z.string().max(200),
  message: z.string().min(10).max(4000),
});

type FormValues = z.infer<typeof formSchema>;

export type ContactFormCopy = {
  fullName: string;
  fullNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  subject: string;
  subjectPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
  errorGeneric: string;
  errorRateLimited: string;
  errorValidation: string;
  consent: string;
};

export function ContactForm({
  locale,
  copy,
}: {
  locale: "ar" | "en";
  copy: ContactFormCopy;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: (zodResolver as unknown as (schema: unknown) => Resolver<FormValues>)(
      formSchema,
    ),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    startTransition(async () => {
      const res = await submitContactMessage({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || null,
        subject: values.subject || null,
        message: values.message,
        locale,
      });

      if (res.ok) {
        toast.success(copy.success);
        setSubmitted(true);
        reset();
        return;
      }

      if (res.code === "rate_limited") {
        toast.error(copy.errorRateLimited);
      } else if (res.code === "validation") {
        toast.error(copy.errorValidation);
      } else {
        toast.error(copy.errorGeneric);
      }
    });
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-10 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold">
          <IconCheck className="size-6" />
        </div>
        <p className="mt-4 text-lg font-semibold">{copy.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={copy.fullName}
          error={errors.fullName?.message}
          required
          className="sm:col-span-2"
        >
          <Input
            type="text"
            placeholder={copy.fullNamePlaceholder}
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
        </Field>

        <Field label={copy.email} error={errors.email?.message} required>
          <Input
            type="email"
            placeholder={copy.emailPlaceholder}
            dir="ltr"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field label={copy.phone} error={errors.phone?.message}>
          <Input
            type="tel"
            placeholder={copy.phonePlaceholder}
            dir="ltr"
            {...register("phone")}
          />
        </Field>

        <Field
          label={copy.subject}
          error={errors.subject?.message}
          className="sm:col-span-2"
        >
          <Input
            type="text"
            placeholder={copy.subjectPlaceholder}
            {...register("subject")}
          />
        </Field>

        <Field
          label={copy.message}
          error={errors.message?.message}
          required
          className="sm:col-span-2"
        >
          <Textarea
            rows={6}
            placeholder={copy.messagePlaceholder}
            aria-invalid={!!errors.message}
            {...register("message")}
          />
        </Field>
      </div>

      <p className="text-xs text-muted-foreground">{copy.consent}</p>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="bg-brand-navy text-brand-cream hover:bg-brand-navy-hover"
        >
          {isPending ? copy.submitting : copy.submit}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
