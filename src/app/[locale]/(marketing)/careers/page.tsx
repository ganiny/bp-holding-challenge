import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowRight,
  IconBriefcase,
  IconMapPin,
  IconCalendarTime,
} from "@tabler/icons-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "careers" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("careers")
    .select(
      "slug,title_en,title_ar,department_en,department_ar,location_en,location_ar,type_en,type_ar,closes_at",
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  const fmtDate = (iso: string | null) => {
    if (!iso) return null;
    try {
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const items = (rows ?? []).map((c) => ({
    slug: c.slug,
    title: locale === "ar" ? c.title_ar : c.title_en,
    department: locale === "ar" ? c.department_ar : c.department_en,
    location: locale === "ar" ? c.location_ar : c.location_en,
    type: locale === "ar" ? c.type_ar : c.type_en,
    closesAt: c.closes_at,
  }));

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-brand-navy text-brand-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
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

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {items.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {items.map((job) => (
              <li key={job.slug}>
                <Link
                  href={`/careers/${job.slug}`}
                  className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/40 hover:shadow-lg"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      {job.department ? (
                        <p className="text-xs font-mono uppercase tracking-widest text-brand-gold">
                          {job.department}
                        </p>
                      ) : null}
                      <h2 className="mt-2 text-xl font-semibold leading-snug text-balance group-hover:text-brand-navy dark:group-hover:text-brand-gold">
                        {job.title}
                      </h2>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {t("card.openLabel")}
                    </Badge>
                  </div>

                  <dl className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    {job.location ? (
                      <Meta icon={<IconMapPin className="size-4" />}>
                        {job.location}
                      </Meta>
                    ) : null}
                    {job.type ? (
                      <Meta icon={<IconBriefcase className="size-4" />}>
                        {job.type}
                      </Meta>
                    ) : null}
                    {job.closesAt ? (
                      <Meta icon={<IconCalendarTime className="size-4" />}>
                        {t("card.closesLabel")}: {fmtDate(job.closesAt)}
                      </Meta>
                    ) : null}
                  </dl>

                  <div className="mt-auto flex items-center gap-2 text-sm font-medium text-brand-navy dark:text-brand-gold">
                    {t("card.details")}
                    <IconArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

    </main>
  );
}

function Meta({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-brand-gold">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
