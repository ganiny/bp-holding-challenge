import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContractorForm } from "@/components/marketing/ContractorForm";
import {
  IconClipboardCheck,
  IconUsersGroup,
  IconShieldCheck,
} from "@tabler/icons-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contractors" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ContractorsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contractors");

  const benefits = [
    {
      icon: <IconUsersGroup className="size-5" />,
      title: t("benefits.partnership.title"),
      body: t("benefits.partnership.body"),
    },
    {
      icon: <IconClipboardCheck className="size-5" />,
      title: t("benefits.pipeline.title"),
      body: t("benefits.pipeline.body"),
    },
    {
      icon: <IconShieldCheck className="size-5" />,
      title: t("benefits.compliance.title"),
      body: t("benefits.compliance.body"),
    },
  ];

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-brand-navy text-brand-cream">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-base text-brand-cream/85 sm:text-lg">
            {t("lead")}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <ul className="grid gap-4 sm:grid-cols-3">
          {benefits.map((b) => (
            <li
              key={b.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                {b.icon}
              </div>
              <h3 className="mt-3 text-base font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("formTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("formSubtitle")}
          </p>
        </div>

        <ContractorForm
          locale={locale === "ar" ? "ar" : "en"}
          copy={{
            sectionCompanyTitle: t("form.sectionCompanyTitle"),
            sectionCompanySubtitle: t("form.sectionCompanySubtitle"),
            sectionContactTitle: t("form.sectionContactTitle"),
            sectionContactSubtitle: t("form.sectionContactSubtitle"),
            sectionDocumentsTitle: t("form.sectionDocumentsTitle"),
            sectionDocumentsSubtitle: t("form.sectionDocumentsSubtitle"),
            companyName: t("form.companyName"),
            companyNamePlaceholder: t("form.companyNamePlaceholder"),
            crNumber: t("form.crNumber"),
            crNumberPlaceholder: t("form.crNumberPlaceholder"),
            vatNumber: t("form.vatNumber"),
            vatNumberPlaceholder: t("form.vatNumberPlaceholder"),
            country: t("form.country"),
            countryPlaceholder: t("form.countryPlaceholder"),
            city: t("form.city"),
            cityPlaceholder: t("form.cityPlaceholder"),
            specialtyEn: t("form.specialtyEn"),
            specialtyEnPlaceholder: t("form.specialtyEnPlaceholder"),
            specialtyAr: t("form.specialtyAr"),
            specialtyArPlaceholder: t("form.specialtyArPlaceholder"),
            yearsExperience: t("form.yearsExperience"),
            yearsExperiencePlaceholder: t("form.yearsExperiencePlaceholder"),
            website: t("form.website"),
            contactName: t("form.contactName"),
            contactNamePlaceholder: t("form.contactNamePlaceholder"),
            email: t("form.email"),
            emailPlaceholder: t("form.emailPlaceholder"),
            phone: t("form.phone"),
            phonePlaceholder: t("form.phonePlaceholder"),
            notes: t("form.notes"),
            notesPlaceholder: t("form.notesPlaceholder"),
            documents: t("form.documents"),
            documentsHint: t("form.documentsHint"),
            documentsUploadLabel: t("form.documentsUploadLabel"),
            documentsUploadedCount: t("form.documentsUploadedCount"),
            documentsRemove: t("form.documentsRemove"),
            submit: t("form.submit"),
            submitting: t("form.submitting"),
            success: t("form.success"),
            errorGeneric: t("form.errorGeneric"),
            errorRateLimited: t("form.errorRateLimited"),
            errorValidation: t("form.errorValidation"),
            consent: t("form.consent"),
          }}
        />
      </section>
    </main>
  );
}
