import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { IconArrowRight, IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { SERVICE_PLACEHOLDER_IMAGE, FALLBACK_PLACEHOLDER } from "@/data/service-images";

/** Slug → which `projects.sector` values to surface in the related-projects list. */
const SERVICE_SECTOR_FILTER: Record<string, string[]> = {
  "residential-construction": ["residential"],
  "structural-works": ["structural"],
  "interior-finishing": ["interior-finishing", "interior"],
  "engineering-consulting": ["engineering-consulting"],
  "general-contracting": ["general-contracting"],
};

export async function generateStaticParams() {
  // We could query Supabase here to pre-render every published service.
  // Keeping it dynamic for now so admins don't need a redeploy after publishing.
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: service } = await supabase
    .from("services")
    .select("title_en,title_ar,summary_en,summary_ar")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!service) return {};

  return {
    title: locale === "ar" ? service.title_ar : service.title_en,
    description: (locale === "ar" ? service.summary_ar : service.summary_en) ?? undefined,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  const supabase = await createSupabaseServerClient();
  const { data: service } = await supabase
    .from("services")
    .select(
      "slug,title_en,title_ar,summary_en,summary_ar,description_en,description_ar,cover_image_path",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!service) notFound();

  const title = locale === "ar" ? service.title_ar : service.title_en;
  const summary = (locale === "ar" ? service.summary_ar : service.summary_en) ?? "";
  const description = (locale === "ar" ? service.description_ar : service.description_en) ?? "";
  const cover = SERVICE_PLACEHOLDER_IMAGE[slug] ?? FALLBACK_PLACEHOLDER;

  // Related projects — match this service's sector(s).
  const sectors = SERVICE_SECTOR_FILTER[slug] ?? [];
  const { data: relatedProjects } = sectors.length
    ? await supabase
        .from("projects")
        .select("slug,title_en,title_ar,summary_en,summary_ar,location_en,location_ar,year")
        .eq("status", "published")
        .in("sector", sectors)
        .order("sort_order", { ascending: true })
        .limit(6)
    : { data: [] as never[] };

  // Static highlights — copy that complements every service card.
  const highlights = locale === "ar"
    ? [
        "نقطة مساءلة واحدة من البداية حتى التسليم",
        "التزام بكود البناء السعودي وأفضل الممارسات الدولية",
        "تواصل أسبوعي شفّاف وتقارير تقدّم منتظمة",
        "ضمان شامل بعد التسليم وفترة دعم ممتدة",
      ]
    : [
        "Single point of accountability from kickoff to handover",
        "Saudi Building Code compliance + international best practice",
        "Transparent weekly comms and progress reporting",
        "Post-delivery warranty and extended support window",
      ];

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-brand-navy text-brand-cream">
        <Image
          src={cover}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 via-brand-navy/85 to-brand-navy" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <Link
            href="/services"
            className="inline-flex items-center text-xs font-mono uppercase tracking-[0.18em] text-brand-gold hover:text-brand-cream transition-colors"
          >
            <IconArrowLeft className="me-2 size-4 rtl:rotate-180" />
            {t("detail.backToServices")}
          </Link>
          <h1 className="mt-6 max-w-4xl text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {summary ? (
            <p className="mt-6 max-w-2xl text-balance text-base text-brand-cream/85 sm:text-lg">
              {summary}
            </p>
          ) : null}
        </div>
      </section>

      {/* Description + highlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 text-base leading-relaxed text-foreground/90">
            {description
              ? description.split(/\n+/).map((para, i) => <p key={i}>{para}</p>)
              : <p className="text-muted-foreground">{summary}</p>
            }
          </div>
          <aside className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
              {t("detail.highlightsTitle")}
            </h2>
            <ul className="space-y-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                    <IconCheck className="size-3" />
                  </span>
                  <span className="text-sm">{h}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* Related projects */}
      <section className="bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <header className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("detail.relatedTitle")}
            </h2>
          </header>
          {relatedProjects && relatedProjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((p) => (
                <Link
                  key={p.slug}
                  href={`/portfolio/${p.slug}`}
                  className="group block rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand-gold/40"
                >
                  <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    {(locale === "ar" ? p.location_ar : p.location_en) ?? ""}
                    {p.year ? ` · ${p.year}` : ""}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight group-hover:text-brand-gold transition-colors">
                    {locale === "ar" ? p.title_ar : p.title_en}
                  </h3>
                  {(locale === "ar" ? p.summary_ar : p.summary_en) ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {locale === "ar" ? p.summary_ar : p.summary_en}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("detail.relatedEmpty")}</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("ctaTitle")}</h2>
        <Button asChild size="lg" className="mt-8 bg-brand-navy text-brand-cream hover:bg-brand-navy-hover">
          <Link href="/rfq">
            {t("ctaButton")}
            <IconArrowRight className="ms-2 size-4 rtl:rotate-180" />
          </Link>
        </Button>
      </section>
    </main>
  );
}
