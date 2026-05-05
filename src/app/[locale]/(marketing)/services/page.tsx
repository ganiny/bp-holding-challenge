import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ServicesFocusGrid, type ServiceCard } from "@/components/marketing/ServicesFocusGrid";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { IconArrowRight } from "@tabler/icons-react";
import { SERVICE_PLACEHOLDER_IMAGE, FALLBACK_PLACEHOLDER } from "@/data/service-images";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  const supabase = await createSupabaseServerClient();
  const { data: services } = await supabase
    .from("services")
    .select("slug,title_en,title_ar,summary_en,summary_ar,cover_image_path")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const cards: ServiceCard[] = (services ?? []).map((s) => ({
    slug: s.slug,
    title: locale === "ar" ? s.title_ar : s.title_en,
    summary: (locale === "ar" ? s.summary_ar : s.summary_en) ?? "",
    cover: SERVICE_PLACEHOLDER_IMAGE[s.slug] ?? FALLBACK_PLACEHOLDER,
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
        <ServicesFocusGrid cards={cards} ctaLabel={t("exploreLabel")} />
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
