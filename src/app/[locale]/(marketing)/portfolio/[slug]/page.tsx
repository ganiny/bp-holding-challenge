import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/lib/i18n/navigation";
import {
  IconArrowLeft,
  IconArrowRight,
  IconMapPin,
  IconCalendar,
  IconBriefcase,
  IconBuildingFactory2,
} from "@tabler/icons-react";
import {
  PROJECT_PLACEHOLDER_IMAGE,
  PROJECT_FALLBACK_IMAGE,
} from "@/data/project-images";
import { Image, ImageKitProvider } from "@imagekit/next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: p } = await supabase
    .from("projects")
    .select("title_en,title_ar,summary_en,summary_ar")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!p) return {};
  return {
    title: locale === "ar" ? p.title_ar : p.title_en,
    description: (locale === "ar" ? p.summary_ar : p.summary_en) ?? undefined,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portfolio");
  const tSectors = await getTranslations("sectors");

  const supabase = await createSupabaseServerClient();
  const { data: project } = await supabase
    .from("projects")
    .select(
      "slug,title_en,title_ar,summary_en,summary_ar,description_en,description_ar,sector,client,location_en,location_ar,year,cover_image_path",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!project) notFound();

  const title = locale === "ar" ? project.title_ar : project.title_en;
  const summary =
    (locale === "ar" ? project.summary_ar : project.summary_en) ?? "";
  const description =
    (locale === "ar" ? project.description_ar : project.description_en) ?? "";
  const location = locale === "ar" ? project.location_ar : project.location_en;
  const cover =
    (project.cover_image_path &&
    !project.cover_image_path.startsWith("/public/projects/placeholder-")
      ? project.cover_image_path
      : PROJECT_PLACEHOLDER_IMAGE[slug]) ?? PROJECT_FALLBACK_IMAGE;

  const sectorMap: Record<
    string,
    "residential" | "structural" | "interior" | "consulting" | "general"
  > = {
    residential: "residential",
    structural: "structural",
    interior: "interior",
    "interior-finishing": "interior",
    consulting: "consulting",
    "engineering-consulting": "consulting",
    general: "general",
    "general-contracting": "general",
  };
  const sectorLabelKey = project.sector ? sectorMap[project.sector] : undefined;
  const sectorLabel = sectorLabelKey
    ? tSectors(sectorLabelKey)
    : (project.sector ?? "");

  // Media gallery (project_media — likely empty for now).
  const { data: media } = await supabase
    .from("project_media")
    .select("id,kind,file_path,thumbnail_path,caption_en,caption_ar")
    .eq(
      "project_id",
      (
        await supabase
          .from("projects")
          .select("id")
          .eq("slug", slug)
          .maybeSingle()
      ).data?.id ?? "",
    )
    .order("sort_order", { ascending: true });

  // Related projects — same sector, exclude this slug.
  const { data: related } = project.sector
    ? await supabase
        .from("projects")
        .select(
          "slug,title_en,title_ar,summary_en,summary_ar,location_en,location_ar,year",
        )
        .eq("status", "published")
        .eq("sector", project.sector)
        .neq("slug", slug)
        .order("sort_order", { ascending: true })
        .limit(3)
    : { data: [] as never[] };

  // Static highlights — same set as services for now; can be project-specific later.
  const highlights =
    locale === "ar"
      ? [
          "تسليم في الموعد ضمن الميزانية",
          "التزام كامل بكود البناء السعودي",
          "تنسيق متكامل بين كافة التخصصات",
          "تواصل أسبوعي شفّاف مع العميل",
        ]
      : [
          "Delivered on time, within budget",
          "Full Saudi Building Code compliance",
          "Coordinated multi-discipline execution",
          "Transparent weekly client communication",
        ];

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-brand-navy text-brand-cream">
        <ImageKitProvider
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
        >
          <Image
            src={cover}
            alt="cover image"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
        </ImageKitProvider>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 via-brand-navy/85 to-brand-navy" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <Link
            href="/portfolio"
            className="inline-flex items-center text-xs font-mono uppercase tracking-[0.18em] text-brand-gold hover:text-brand-cream transition-colors"
          >
            <IconArrowLeft className="me-2 size-4 rtl:rotate-180" />
            {t("detail.back")}
          </Link>
          <div>
            {sectorLabel ? (
              <Badge className="mt-6 bg-brand-gold text-brand-navy hover:bg-brand-gold-hover">
                {sectorLabel}
              </Badge>
            ) : null}
            <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {summary ? (
              <p className="mt-6 max-w-2xl text-balance text-base text-brand-cream/85 sm:text-lg">
                {summary}
              </p>
            ) : null}
          </div>

          {/* Meta strip */}
          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-brand-cream/15 pt-8 sm:grid-cols-4">
            <MetaItem
              icon={<IconBuildingFactory2 className="size-4 text-brand-gold" />}
              label={t("detail.metaSector")}
              value={sectorLabel}
            />
            <MetaItem
              icon={<IconMapPin className="size-4 text-brand-gold" />}
              label={t("detail.metaLocation")}
              value={location ?? ""}
            />
            <MetaItem
              icon={<IconCalendar className="size-4 text-brand-gold" />}
              label={t("detail.metaYear")}
              value={project.year ? String(project.year) : ""}
            />
            <MetaItem
              icon={<IconBriefcase className="size-4 text-brand-gold" />}
              label={t("detail.metaClient")}
              value={project.client ?? "—"}
            />
          </dl>
        </div>
      </section>

      {/* Overview + highlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("detail.overviewTitle")}
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-foreground/90">
              {description ? (
                description.split(/\n+/).map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <p className="text-muted-foreground">{summary}</p>
              )}
            </div>
          </div>
          <aside className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
              {t("detail.highlightsTitle")}
            </h3>
            <ul className="space-y-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-brand-gold" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* Gallery (only render if media exists) */}
      {media && media.length > 0 ? (
        <section className="bg-card/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl mb-10">
              {t("detail.galleryTitle")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {media.map((m) => (
                <figure
                  key={m.id}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="relative aspect-[4/3]">
                    <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}>
                      <Image
                        src={m.file_path}
                        alt={
                          (locale === "ar" ? m.caption_ar : m.caption_en) ?? ""
                        }
                        fill
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover"
                      />
                    </ImageKitProvider>
                  </div>
                  {(locale === "ar" ? m.caption_ar : m.caption_en) ? (
                    <figcaption className="p-4 text-sm text-muted-foreground">
                      {locale === "ar" ? m.caption_ar : m.caption_en}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Related */}
      {related && related.length > 0 ? (
        <section className="bg-card/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl mb-10">
              {t("detail.relatedTitle")}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((p) => (
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
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("ctaTitle")}
        </h2>
        <Button
          asChild
          size="lg"
          className="mt-8 bg-brand-navy text-brand-cream hover:bg-brand-navy-hover"
        >
          <Link href="/rfq">
            {t("ctaButton")}
            <IconArrowRight className="ms-2 size-4 rtl:rotate-180" />
          </Link>
        </Button>
      </section>
    </main>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  if (!value) return null;
  return (
    <div className="space-y-1.5">
      <dt className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-brand-cream/70">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-medium text-brand-cream">{value}</dd>
    </div>
  );
}
