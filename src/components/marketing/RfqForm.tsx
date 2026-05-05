"use client";

import { useState, useTransition } from "react";
import {
  useForm,
  Controller,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ImageKitUploader,
  type UploadResult,
} from "@/components/imagekit/ImageKitUploader";
import { submitRfq } from "@/app/[locale]/(marketing)/rfq/actions";
import { budgetRangeValues } from "@/lib/validation/rfq";
import { IconCheck, IconFileText, IconX } from "@tabler/icons-react";

const formSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(5).max(40),
  company: z.string().max(160),
  projectType: z.string().max(160),
  budget: z.enum(budgetRangeValues),
  location: z.string().max(160),
  startDate: z.string().max(40),
  description: z.string().min(20).max(4000),
});

type FormValues = z.infer<typeof formSchema>;

export type RfqFormCopy = {
  sectionContactTitle: string;
  sectionContactSubtitle: string;
  sectionProjectTitle: string;
  sectionProjectSubtitle: string;
  sectionAttachmentsTitle: string;
  sectionAttachmentsSubtitle: string;
  fullName: string;
  fullNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  company: string;
  companyPlaceholder: string;
  projectType: string;
  projectTypePlaceholder: string;
  budget: string;
  budgetPlaceholder: string;
  budgetOptions: Record<(typeof budgetRangeValues)[number], string>;
  location: string;
  locationPlaceholder: string;
  startDate: string;
  description: string;
  descriptionPlaceholder: string;
  attachments: string;
  attachmentsHint: string;
  attachmentsUploadLabel: string;
  attachmentsUploadedCount: string;
  attachmentsRemove: string;
  submit: string;
  submitting: string;
  success: string;
  successDetail: string;
  errorGeneric: string;
  errorRateLimited: string;
  errorValidation: string;
  consent: string;
};

export function RfqForm({
  locale,
  copy,
}: {
  locale: "ar" | "en";
  copy: RfqFormCopy;
}) {
  const [attachments, setAttachments] = useState<UploadResult[]>([]);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
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
      company: "",
      projectType: "",
      budget: "unspecified",
      location: "",
      startDate: "",
      description: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    startTransition(async () => {
      const res = await submitRfq({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        company: values.company || null,
        projectType: values.projectType || null,
        budget: values.budget,
        location: values.location || null,
        startDate: values.startDate || null,
        description: values.description,
        attachmentPaths: attachments.map((a) => a.filePath),
        locale,
      });

      if (res.ok) {
        toast.success(copy.success);
        setSubmittedRef(res.rfqId);
        reset();
        setAttachments([]);
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

  if (submittedRef) {
    return (
      <div className="rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-10 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold">
          <IconCheck className="size-6" />
        </div>
        <p className="mt-4 text-lg font-semibold">{copy.success}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {copy.successDetail.replace("{ref}", submittedRef.slice(0, 8))}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <Section
        title={copy.sectionContactTitle}
        subtitle={copy.sectionContactSubtitle}
      >
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

          <Field label={copy.phone} error={errors.phone?.message} required>
            <Input
              type="tel"
              placeholder={copy.phonePlaceholder}
              dir="ltr"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
          </Field>

          <Field
            label={copy.company}
            error={errors.company?.message}
            className="sm:col-span-2"
          >
            <Input
              type="text"
              placeholder={copy.companyPlaceholder}
              {...register("company")}
            />
          </Field>
        </div>
      </Section>

      <Section
        title={copy.sectionProjectTitle}
        subtitle={copy.sectionProjectSubtitle}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={copy.projectType}
            error={errors.projectType?.message}
            className="sm:col-span-2"
          >
            <Input
              type="text"
              placeholder={copy.projectTypePlaceholder}
              {...register("projectType")}
            />
          </Field>

          <Field label={copy.budget} error={errors.budget?.message}>
            <Controller
              control={control}
              name="budget"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={copy.budgetPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRangeValues.map((v) => (
                      <SelectItem key={v} value={v}>
                        {copy.budgetOptions[v]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label={copy.location} error={errors.location?.message}>
            <Input
              type="text"
              placeholder={copy.locationPlaceholder}
              {...register("location")}
            />
          </Field>

          <Field
            label={copy.startDate}
            error={errors.startDate?.message}
            className="sm:col-span-2"
          >
            <Input type="date" dir="ltr" {...register("startDate")} />
          </Field>

          <Field
            label={copy.description}
            error={errors.description?.message}
            required
            className="sm:col-span-2"
          >
            <Textarea
              rows={6}
              placeholder={copy.descriptionPlaceholder}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
          </Field>
        </div>
      </Section>

      <Section
        title={copy.sectionAttachmentsTitle}
        subtitle={copy.sectionAttachmentsSubtitle}
      >
        <div>
          <Label className="text-sm font-medium">{copy.attachments}</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            {copy.attachmentsHint}
          </p>

          {attachments.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {attachments.map((doc, idx) => (
                <li
                  key={doc.filePath}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2 truncate">
                    <IconFileText className="size-4 shrink-0 text-brand-gold" />
                    <span className="truncate">
                      {doc.filePath.split("/").pop()}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {(doc.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={copy.attachmentsRemove}
                  >
                    <IconX className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <ImageKitUploader
              folder="/public/rfqs"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.zip,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              multiple
              maxSizeMB={15}
              label={copy.attachmentsUploadLabel}
              onUploaded={(results) =>
                setAttachments((prev) => [...prev, ...results].slice(0, 8))
              }
            />
            {attachments.length > 0 ? (
              <span className="text-xs text-muted-foreground">
                {copy.attachmentsUploadedCount.replace(
                  "{count}",
                  String(attachments.length),
                )}
              </span>
            ) : null}
          </div>
        </div>
      </Section>

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

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <header className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
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
