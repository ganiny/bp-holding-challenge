import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StudioGallery, type StudioItem } from "@/components/marketing/StudioGallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studio" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function StudioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("studio");

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("media_studio")
    .select("id,kind,file_path,thumbnail_path,caption_en,caption_ar,tags")
    .eq("visibility", "public")
    .order("sort_order", { ascending: true });

  const items: StudioItem[] = (rows ?? []).map((m) => ({
    id: m.id,
    kind: m.kind,
    url: m.file_path,
    thumbnail: m.thumbnail_path,
    caption: locale === "ar" ? m.caption_ar : m.caption_en,
    tags: m.tags,
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
          <p className="py-20 text-center text-muted-foreground">{t("metaDescription")}</p>
        ) : (
          <StudioGallery
            items={items}
            copy={{
              previous: t("previousImage"),
              next: t("nextImage"),
              close: t("closeLightbox"),
              videoLabel: t("video"),
            }}
          />
        )}
      </section>
    </main>
  );
}
