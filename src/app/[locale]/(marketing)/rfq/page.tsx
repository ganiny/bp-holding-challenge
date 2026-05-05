import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { RfqForm } from "@/components/marketing/RfqForm";
import {
  IconClockHour4,
  IconRoute,
  IconShieldLock,
} from "@tabler/icons-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rfq" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function RfqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("rfq");

  const highlights = [
    {
      icon: <IconClockHour4 className="size-5" />,
      title: t("highlights.response.title"),
      body: t("highlights.response.body"),
    },
    {
      icon: <IconRoute className="size-5" />,
      title: t("highlights.scope.title"),
      body: t("highlights.scope.body"),
    },
    {
      icon: <IconShieldLock className="size-5" />,
      title: t("highlights.confidential.title"),
      body: t("highlights.confidential.body"),
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
          {highlights.map((h) => (
            <li
              key={h.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                {h.icon}
              </div>
              <h3 className="mt-3 text-base font-semibold">{h.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{h.body}</p>
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

        <RfqForm
          locale={locale === "ar" ? "ar" : "en"}
          copy={{
            sectionContactTitle: t("form.sectionContactTitle"),
            sectionContactSubtitle: t("form.sectionContactSubtitle"),
            sectionProjectTitle: t("form.sectionProjectTitle"),
            sectionProjectSubtitle: t("form.sectionProjectSubtitle"),
            sectionAttachmentsTitle: t("form.sectionAttachmentsTitle"),
            sectionAttachmentsSubtitle: t("form.sectionAttachmentsSubtitle"),
            fullName: t("form.fullName"),
            fullNamePlaceholder: t("form.fullNamePlaceholder"),
            email: t("form.email"),
            emailPlaceholder: t("form.emailPlaceholder"),
            phone: t("form.phone"),
            phonePlaceholder: t("form.phonePlaceholder"),
            company: t("form.company"),
            companyPlaceholder: t("form.companyPlaceholder"),
            projectType: t("form.projectType"),
            projectTypePlaceholder: t("form.projectTypePlaceholder"),
            budget: t("form.budget"),
            budgetPlaceholder: t("form.budgetPlaceholder"),
            budgetOptions: {
              under_100k: t("form.budgetUnder100k"),
              "100k_500k": t("form.budget100k500k"),
              "500k_1m": t("form.budget500k1m"),
              "1m_5m": t("form.budget1m5m"),
              over_5m: t("form.budgetOver5m"),
              unspecified: t("form.budgetUnspecified"),
            },
            location: t("form.location"),
            locationPlaceholder: t("form.locationPlaceholder"),
            startDate: t("form.startDate"),
            description: t("form.description"),
            descriptionPlaceholder: t("form.descriptionPlaceholder"),
            attachments: t("form.attachments"),
            attachmentsHint: t("form.attachmentsHint"),
            attachmentsUploadLabel: t("form.attachmentsUploadLabel"),
            attachmentsUploadedCount: t("form.attachmentsUploadedCount"),
            attachmentsRemove: t("form.attachmentsRemove"),
            submit: t("form.submit"),
            submitting: t("form.submitting"),
            success: t("form.success"),
            successDetail: t("form.successDetail"),
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
