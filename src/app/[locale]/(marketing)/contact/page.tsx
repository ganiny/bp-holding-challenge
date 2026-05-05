import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/marketing/ContactForm";
import {
  IconBuilding,
  IconMail,
  IconPhone,
  IconClock,
  IconArrowRight,
} from "@tabler/icons-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

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

      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <aside className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("officesTitle")}
            </h2>
            <ul className="mt-4 space-y-4">
              <li className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                    <IconBuilding className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t("hq.name")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("hq.address")}
                    </p>
                  </div>
                </div>
              </li>
              <li className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                    <IconBuilding className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t("branch.name")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("branch.address")}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("channelsTitle")}
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <IconPhone className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("phoneLabel")}
                  </p>
                  <a
                    href={`tel:${t("phone").replace(/\s/g, "")}`}
                    className="font-medium hover:text-brand-gold"
                    dir="ltr"
                  >
                    {t("phone")}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <IconMail className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("emailLabel")}
                  </p>
                  <a
                    href={`mailto:${t("email")}`}
                    className="font-medium hover:text-brand-gold"
                    dir="ltr"
                  >
                    {t("email")}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <IconClock className="size-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("hoursLabel")}
                  </p>
                  <p className="font-medium">{t("hours")}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-5">
            <p className="text-sm">{t("rfqLink")}</p>
            <Link
              href="/rfq"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:text-brand-gold dark:text-brand-cream"
            >
              {t("rfqLinkCta")}
              <IconArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>
        </aside>

        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("formTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("formSubtitle")}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <ContactForm
              locale={locale === "ar" ? "ar" : "en"}
              copy={{
                fullName: t("form.fullName"),
                fullNamePlaceholder: t("form.fullNamePlaceholder"),
                email: t("form.email"),
                emailPlaceholder: t("form.emailPlaceholder"),
                phone: t("form.phone"),
                phonePlaceholder: t("form.phonePlaceholder"),
                subject: t("form.subject"),
                subjectPlaceholder: t("form.subjectPlaceholder"),
                message: t("form.message"),
                messagePlaceholder: t("form.messagePlaceholder"),
                submit: t("form.submit"),
                submitting: t("form.submitting"),
                success: t("form.success"),
                errorGeneric: t("form.errorGeneric"),
                errorRateLimited: t("form.errorRateLimited"),
                errorValidation: t("form.errorValidation"),
                consent: t("form.consent"),
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
