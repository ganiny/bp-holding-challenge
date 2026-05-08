import { setRequestLocale } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Hero } from "@/components/marketing/Hero";
import { StatsCounter } from "@/components/marketing/StatsCounter";
import { ServicesBento } from "@/components/marketing/ServicesBento";
import {
  FeaturedProjects,
  type FeaturedProject,
} from "@/components/marketing/FeaturedProjects";
import { Testimonials } from "@/components/marketing/Testimonials";
import { CtaBanner } from "@/components/marketing/CtaBanner";
import type { Locale } from "@/lib/i18n/routing";
import { getSiteContentBlock, pickLocale } from "@/lib/site-content/server";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const [{ data: rawProjects }, hero, cta] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "slug,title_en,title_ar,summary_en,summary_ar,location_en,location_ar,year,cover_image_path",
      )
      .eq("status", "published")
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .limit(9),
    getSiteContentBlock("home.hero"),
    getSiteContentBlock("home.cta"),
  ]);

  const projects: FeaturedProject[] = (rawProjects ?? []).map((p) => ({
    slug: p.slug,
    title: locale === "ar" ? p.title_ar : p.title_en,
    summary: locale === "ar" ? p.summary_ar : p.summary_en,
    location: locale === "ar" ? p.location_ar : p.location_en,
    year: p.year,
    cover: p.cover_image_path ?? "",
  }));

  return (
    <main className="flex flex-1 flex-col">
      <Hero
        overrides={{
          eyebrow: pickLocale(localeTyped, hero.eyebrow_ar, hero.eyebrow_en),
          title: pickLocale(localeTyped, hero.title_ar, hero.title_en),
          subtitle: pickLocale(localeTyped, hero.subtitle_ar, hero.subtitle_en),
          ctaPrimaryLabel: pickLocale(
            localeTyped,
            hero.cta_primary_label_ar,
            hero.cta_primary_label_en,
          ),
          ctaPrimaryHref: hero.cta_primary_href,
          ctaSecondaryLabel: pickLocale(
            localeTyped,
            hero.cta_secondary_label_ar,
            hero.cta_secondary_label_en,
          ),
          ctaSecondaryHref: hero.cta_secondary_href,
          sliderImagePaths: hero.slider_images.map((s) => s.file_path),
        }}
      />
      <StatsCounter />
      <ServicesBento locale={locale as Locale} />
      <FeaturedProjects projects={projects} />
      <Testimonials locale={locale as Locale} />
      <CtaBanner
        overrides={{
          title: pickLocale(localeTyped, cta.title_ar, cta.title_en),
          subtitle: pickLocale(localeTyped, cta.subtitle_ar, cta.subtitle_en),
          buttonLabel: pickLocale(
            localeTyped,
            cta.button_label_ar,
            cta.button_label_en,
          ),
          buttonHref: cta.button_href,
        }}
      />
    </main>
  );
}
