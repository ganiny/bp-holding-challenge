import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { JobApplyForm } from "@/components/marketing/JobApplyForm";
import {
  IconArrowLeft,
  IconBriefcase,
  IconBuilding,
  IconMapPin,
  IconCalendarTime,
} from "@tabler/icons-react";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("careers")
    .select("title_en,title_ar,description_en,description_ar")
    .eq("slug", slug)
    .eq("status", "open")
    .maybeSingle();

  const t = await getTranslations({ locale, namespace: "careers" });

  if (!data) {
    return { title: t("metaTitle") };
  }
  const title = locale === "ar" ? data.title_ar : data.title_en;
  const description =
    (locale === "ar" ? data.description_ar : data.description_en) ??
    t("metaDescription");
  return {
    title: `${title} — ${t("metaTitle")}`,
    description: description.slice(0, 160),
  };
}

export default async function CareerDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");

  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("careers")
    .select(
      "id,slug,title_en,title_ar,department_en,department_ar,location_en,location_ar,type_en,type_ar,description_en,description_ar,requirements_en,requirements_ar,closes_at",
    )
    .eq("slug", slug)
    .eq("status", "open")
    .maybeSingle();

  if (!row) notFound();

  const title = locale === "ar" ? row.title_ar : row.title_en;
  const department = locale === "ar" ? row.department_ar : row.department_en;
  const location = locale === "ar" ? row.location_ar : row.location_en;
  const type = locale === "ar" ? row.type_ar : row.type_en;
  const description = locale === "ar" ? row.description_ar : row.description_en;
  const requirements = locale === "ar" ? row.requirements_ar : row.requirements_en;

  const closesAt = row.closes_at
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(row.closes_at))
    : null;

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-brand-navy text-brand-cream">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.24em] text-brand-cream/70 transition-colors hover:text-brand-gold"
          >
            <IconArrowLeft className="size-4 rtl:rotate-180" />
            {t("detail.back")}
          </Link>
          {department ? (
            <p className="mt-6 text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
              {department}
            </p>
          ) : null}
          <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {department ? (
              <DetailMeta
                icon={<IconBuilding className="size-4" />}
                label={t("detail.metaDepartment")}
                value={department}
              />
            ) : null}
            {location ? (
              <DetailMeta
                icon={<IconMapPin className="size-4" />}
                label={t("detail.metaLocation")}
                value={location}
              />
            ) : null}
            {type ? (
              <DetailMeta
                icon={<IconBriefcase className="size-4" />}
                label={t("detail.metaType")}
                value={type}
              />
            ) : null}
            {closesAt ? (
              <DetailMeta
                icon={<IconCalendarTime className="size-4" />}
                label={t("detail.metaCloses")}
                value={closesAt}
              />
            ) : null}
          </dl>

          <div className="mt-6">
            <Badge className="bg-brand-gold text-brand-navy hover:bg-brand-gold">
              {t("card.openLabel")}
            </Badge>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-10">
            {description ? (
              <article>
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {t("detail.aboutTitle")}
                </h2>
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </article>
            ) : null}

            {requirements ? (
              <article>
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {t("detail.requirementsTitle")}
                </h2>
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                  {requirements}
                </p>
              </article>
            ) : null}
          </div>

          <aside
            id="apply"
            className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:sticky lg:top-24 lg:self-start"
          >
            <h2 className="text-xl font-semibold tracking-tight">
              {t("detail.applyTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("detail.applySubtitle")}
            </p>
            <div className="mt-6">
              <JobApplyForm
                careerId={row.id}
                careerSlug={row.slug}
                locale={locale === "ar" ? "ar" : "en"}
                copy={{
                  fullName: t("form.fullName"),
                  fullNamePlaceholder: t("form.fullNamePlaceholder"),
                  email: t("form.email"),
                  emailPlaceholder: t("form.emailPlaceholder"),
                  phone: t("form.phone"),
                  phonePlaceholder: t("form.phonePlaceholder"),
                  coverLetter: t("form.coverLetter"),
                  coverLetterPlaceholder: t("form.coverLetterPlaceholder"),
                  cv: t("form.cv"),
                  cvHint: t("form.cvHint"),
                  cvUploadLabel: t("form.cvUploadLabel"),
                  cvUploaded: t("form.cvUploaded"),
                  cvReplace: t("form.cvReplace"),
                  portfolioUrl: t("form.portfolioUrl"),
                  linkedinUrl: t("form.linkedinUrl"),
                  submit: t("form.submit"),
                  submitting: t("form.submitting"),
                  success: t("form.success"),
                  errorGeneric: t("form.errorGeneric"),
                  errorRateLimited: t("form.errorRateLimited"),
                  errorValidation: t("form.errorValidation"),
                  errorCvRequired: t("form.errorCvRequired"),
                  consent: t("form.consent"),
                }}
              />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function DetailMeta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-cream/70">
        <span className="text-brand-gold">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-brand-cream">{value}</dd>
    </div>
  );
}
