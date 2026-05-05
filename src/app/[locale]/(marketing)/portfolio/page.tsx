import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PortfolioGrid,
  type PortfolioCard,
} from "@/components/marketing/PortfolioGrid";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { IconArrowRight } from "@tabler/icons-react";
import {
  PROJECT_PLACEHOLDER_IMAGE,
  PROJECT_FALLBACK_IMAGE,
} from "@/data/project-images";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

/** Map a project's sector slug to a translated human label. Falls back to the slug. */
function sectorLabel(
  sector: string | null,
  tSectors: (k: "residential" | "structural" | "interior" | "consulting" | "general") => string,
): string {
  if (!sector) return "";
  const map: Record<string, "residential" | "structural" | "interior" | "consulting" | "general"> = {
    residential: "residential",
    structural: "structural",
    interior: "interior",
    "interior-finishing": "interior",
    consulting: "consulting",
    "engineering-consulting": "consulting",
    general: "general",
    "general-contracting": "general",
  };
  const key = map[sector];
  return key ? tSectors(key) : sector;
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portfolio");
  const tSectors = await getTranslations("sectors");

  const supabase = await createSupabaseServerClient();
  const { data: rawProjects } = await supabase
    .from("projects")
    .select(
      "slug,title_en,title_ar,summary_en,summary_ar,sector,location_en,location_ar,year,cover_image_path",
    )
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const projects: PortfolioCard[] = (rawProjects ?? []).map((p) => ({
    slug: p.slug,
    title: locale === "ar" ? p.title_ar : p.title_en,
    summary: (locale === "ar" ? p.summary_ar : p.summary_en) ?? "",
    sector: p.sector,
    sectorLabel: sectorLabel(p.sector, tSectors),
    location: locale === "ar" ? p.location_ar : p.location_en,
    year: p.year,
    cover:
      (p.cover_image_path && !p.cover_image_path.startsWith("/public/projects/placeholder-")
        ? p.cover_image_path
        : PROJECT_PLACEHOLDER_IMAGE[p.slug]) ?? PROJECT_FALLBACK_IMAGE,
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
        <PortfolioGrid
          projects={projects}
          copy={{
            sector: t("filters.sector"),
            year: t("filters.year"),
            location: t("filters.location"),
            all: t("filters.all"),
            reset: t("filters.reset"),
            noResults: t("filters.noResults"),
          }}
          cardCopy={{ view: t("card.view") }}
        />
      </section>

      <section className="bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("ctaTitle")}</h2>
          <Button asChild size="lg" className="mt-8 bg-brand-navy text-brand-cream hover:bg-brand-navy-hover">
            <Link href="/rfq">
              {t("ctaButton")}
              <IconArrowRight className="ms-2 size-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
