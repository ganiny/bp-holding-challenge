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

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const { data: rawProjects } = await supabase
    .from("projects")
    .select(
      "slug,title_en,title_ar,summary_en,summary_ar,location_en,location_ar,year,cover_image_path",
    )
    .eq("status", "published")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(9);

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
      <Hero />
      <StatsCounter />
      <ServicesBento locale={locale as Locale} />
      <FeaturedProjects projects={projects} />
      <Testimonials locale={locale as Locale} />
      <CtaBanner />
    </main>
  );
}
