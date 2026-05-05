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
import {
  ImageKitUploader,
  type UploadResult,
} from "@/components/imagekit/ImageKitUploader";
import { submitJobApplication } from "@/app/[locale]/(marketing)/careers/actions";
import { IconCheck, IconFileText } from "@tabler/icons-react";

const urlOrEmpty = z
  .string()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), {
    message: "Must be a valid URL",
  });

const formSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(40),
  coverLetter: z.string().max(4000),
  portfolioUrl: urlOrEmpty,
  linkedinUrl: urlOrEmpty,
});

type FormValues = z.infer<typeof formSchema>;

export type JobApplyFormCopy = {
  fullName: string;
  fullNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  coverLetter: string;
  coverLetterPlaceholder: string;
  cv: string;
  cvHint: string;
  cvUploadLabel: string;
  cvUploaded: string;
  cvReplace: string;
  portfolioUrl: string;
  linkedinUrl: string;
  submit: string;
  submitting: string;
  success: string;
  errorGeneric: string;
  errorRateLimited: string;
  errorValidation: string;
  errorCvRequired: string;
  consent: string;
};

export function JobApplyForm({
  careerId,
  careerSlug,
  locale,
  copy,
}: {
  careerId: string;
  careerSlug: string;
  locale: "ar" | "en";
  copy: JobApplyFormCopy;
}) {
  const [cv, setCv] = useState<UploadResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    // zod v4.4 vs @hookform/resolvers/zod v5.2 ABI version-tag mismatch — runtime works, types disagree.
    resolver: (zodResolver as unknown as (schema: unknown) => Resolver<FormValues>)(
      formSchema,
    ),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      coverLetter: "",
      portfolioUrl: "",
      linkedinUrl: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    if (!cv) {
      toast.error(copy.errorCvRequired);
      return;
    }

    startTransition(async () => {
      const res = await submitJobApplication({
        careerId,
        careerSlug,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || null,
        coverLetter: values.coverLetter || null,
        cvFilePath: cv.filePath,
        portfolioUrl: values.portfolioUrl || null,
        linkedinUrl: values.linkedinUrl || null,
        locale,
      });

      if (res.ok) {
        toast.success(copy.success);
        setSubmitted(true);
        reset();
        setCv(null);
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
      <div className="rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-8 text-center">
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

        <Field label={copy.linkedinUrl} error={errors.linkedinUrl?.message}>
          <Input
            type="url"
            placeholder="https://linkedin.com/in/…"
            dir="ltr"
            {...register("linkedinUrl")}
          />
        </Field>

        <Field
          label={copy.portfolioUrl}
          error={errors.portfolioUrl?.message}
          className="sm:col-span-2"
        >
          <Input
            type="url"
            placeholder="https://…"
            dir="ltr"
            {...register("portfolioUrl")}
          />
        </Field>
      </div>

      <Field label={copy.coverLetter} error={errors.coverLetter?.message}>
        <Textarea
          rows={5}
          placeholder={copy.coverLetterPlaceholder}
          {...register("coverLetter")}
        />
      </Field>

      <div>
        <Label className="text-sm font-medium">
          {copy.cv} <span className="text-destructive">*</span>
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">{copy.cvHint}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {cv ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
                <IconFileText className="size-4 text-brand-gold" />
                <span className="max-w-65 truncate">
                  {copy.cvUploaded} {cv.filePath.split("/").pop()}
                </span>
              </span>
              <ImageKitUploader
                folder="/public/applications"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                maxSizeMB={10}
                label={copy.cvReplace}
                onUploaded={(r) => r[0] && setCv(r[0])}
              />
            </>
          ) : (
            <ImageKitUploader
              folder="/public/applications"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              maxSizeMB={10}
              label={copy.cvUploadLabel}
              onUploaded={(r) => r[0] && setCv(r[0])}
            />
          )}
        </div>
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
