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
import { submitContractorApplication } from "@/app/[locale]/(marketing)/contractors/actions";
import { IconCheck, IconFileText, IconX } from "@tabler/icons-react";

const urlOrEmpty = z
  .string()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), {
    message: "Must be a valid URL",
  });

const formSchema = z.object({
  companyName: z.string().min(2).max(160),
  contactName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(5).max(40),
  country: z.string().max(80),
  city: z.string().max(80),
  crNumber: z.string().max(40),
  vatNumber: z.string().max(40),
  specialtyEn: z.string().max(200),
  specialtyAr: z.string().max(200),
  yearsExperience: z.string().max(3),
  website: urlOrEmpty,
  notes: z.string().max(4000),
});

type FormValues = z.infer<typeof formSchema>;

export type ContractorFormCopy = {
  sectionCompanyTitle: string;
  sectionCompanySubtitle: string;
  sectionContactTitle: string;
  sectionContactSubtitle: string;
  sectionDocumentsTitle: string;
  sectionDocumentsSubtitle: string;
  companyName: string;
  companyNamePlaceholder: string;
  crNumber: string;
  crNumberPlaceholder: string;
  vatNumber: string;
  vatNumberPlaceholder: string;
  country: string;
  countryPlaceholder: string;
  city: string;
  cityPlaceholder: string;
  specialtyEn: string;
  specialtyEnPlaceholder: string;
  specialtyAr: string;
  specialtyArPlaceholder: string;
  yearsExperience: string;
  yearsExperiencePlaceholder: string;
  website: string;
  contactName: string;
  contactNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  notes: string;
  notesPlaceholder: string;
  documents: string;
  documentsHint: string;
  documentsUploadLabel: string;
  documentsUploadedCount: string;
  documentsRemove: string;
  submit: string;
  submitting: string;
  success: string;
  errorGeneric: string;
  errorRateLimited: string;
  errorValidation: string;
  consent: string;
};

export function ContractorForm({
  locale,
  copy,
}: {
  locale: "ar" | "en";
  copy: ContractorFormCopy;
}) {
  const [documents, setDocuments] = useState<UploadResult[]>([]);
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
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      crNumber: "",
      vatNumber: "",
      specialtyEn: "",
      specialtyAr: "",
      yearsExperience: "",
      website: "",
      notes: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const yearsParsed = values.yearsExperience.trim() === ""
      ? null
      : Number.parseInt(values.yearsExperience, 10);

    startTransition(async () => {
      const res = await submitContractorApplication({
        companyName: values.companyName,
        contactName: values.contactName,
        email: values.email,
        phone: values.phone,
        country: values.country || null,
        city: values.city || null,
        crNumber: values.crNumber || null,
        vatNumber: values.vatNumber || null,
        specialtyEn: values.specialtyEn || null,
        specialtyAr: values.specialtyAr || null,
        yearsExperience: Number.isFinite(yearsParsed) ? yearsParsed : null,
        website: values.website || null,
        documentPaths: documents.map((d) => d.filePath),
        notes: values.notes || null,
        locale,
      });

      if (res.ok) {
        toast.success(copy.success);
        setSubmitted(true);
        reset();
        setDocuments([]);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <Section
        title={copy.sectionCompanyTitle}
        subtitle={copy.sectionCompanySubtitle}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={copy.companyName}
            error={errors.companyName?.message}
            required
            className="sm:col-span-2"
          >
            <Input
              type="text"
              placeholder={copy.companyNamePlaceholder}
              aria-invalid={!!errors.companyName}
              {...register("companyName")}
            />
          </Field>

          <Field label={copy.crNumber} error={errors.crNumber?.message}>
            <Input
              type="text"
              placeholder={copy.crNumberPlaceholder}
              dir="ltr"
              {...register("crNumber")}
            />
          </Field>

          <Field label={copy.vatNumber} error={errors.vatNumber?.message}>
            <Input
              type="text"
              placeholder={copy.vatNumberPlaceholder}
              dir="ltr"
              {...register("vatNumber")}
            />
          </Field>

          <Field label={copy.country} error={errors.country?.message}>
            <Input
              type="text"
              placeholder={copy.countryPlaceholder}
              {...register("country")}
            />
          </Field>

          <Field label={copy.city} error={errors.city?.message}>
            <Input
              type="text"
              placeholder={copy.cityPlaceholder}
              {...register("city")}
            />
          </Field>

          <Field label={copy.specialtyEn} error={errors.specialtyEn?.message}>
            <Input
              type="text"
              placeholder={copy.specialtyEnPlaceholder}
              dir="ltr"
              {...register("specialtyEn")}
            />
          </Field>

          <Field label={copy.specialtyAr} error={errors.specialtyAr?.message}>
            <Input
              type="text"
              placeholder={copy.specialtyArPlaceholder}
              dir="rtl"
              {...register("specialtyAr")}
            />
          </Field>

          <Field
            label={copy.yearsExperience}
            error={errors.yearsExperience?.message}
          >
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={120}
              placeholder={copy.yearsExperiencePlaceholder}
              dir="ltr"
              {...register("yearsExperience")}
            />
          </Field>

          <Field label={copy.website} error={errors.website?.message}>
            <Input
              type="url"
              placeholder="https://…"
              dir="ltr"
              {...register("website")}
            />
          </Field>
        </div>
      </Section>

      <Section
        title={copy.sectionContactTitle}
        subtitle={copy.sectionContactSubtitle}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={copy.contactName}
            error={errors.contactName?.message}
            required
          >
            <Input
              type="text"
              placeholder={copy.contactNamePlaceholder}
              aria-invalid={!!errors.contactName}
              {...register("contactName")}
            />
          </Field>

          <Field label={copy.email} error={errors.email?.message} required>
            <Input
              type="email"
              placeholder={copy.emailPlaceholder}
              aria-invalid={!!errors.email}
              dir="ltr"
              {...register("email")}
            />
          </Field>

          <Field
            label={copy.phone}
            error={errors.phone?.message}
            required
            className="sm:col-span-2"
          >
            <Input
              type="tel"
              placeholder={copy.phonePlaceholder}
              aria-invalid={!!errors.phone}
              dir="ltr"
              {...register("phone")}
            />
          </Field>

          <Field
            label={copy.notes}
            error={errors.notes?.message}
            className="sm:col-span-2"
          >
            <Textarea
              rows={4}
              placeholder={copy.notesPlaceholder}
              {...register("notes")}
            />
          </Field>
        </div>
      </Section>

      <Section
        title={copy.sectionDocumentsTitle}
        subtitle={copy.sectionDocumentsSubtitle}
      >
        <div>
          <Label className="text-sm font-medium">{copy.documents}</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            {copy.documentsHint}
          </p>

          {documents.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {documents.map((doc, idx) => (
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
                      setDocuments((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={copy.documentsRemove}
                  >
                    <IconX className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <ImageKitUploader
              folder="/public/contractors"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
              multiple
              maxSizeMB={10}
              label={copy.documentsUploadLabel}
              onUploaded={(results) =>
                setDocuments((prev) => [...prev, ...results].slice(0, 10))
              }
            />
            {documents.length > 0 ? (
              <span className="text-xs text-muted-foreground">
                {copy.documentsUploadedCount.replace(
                  "{count}",
                  String(documents.length),
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
