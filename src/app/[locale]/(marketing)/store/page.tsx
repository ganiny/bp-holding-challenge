import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StoreGrid, type StoreCard } from "@/components/store/StoreGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "store" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

type ProductRow = {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  category_en: string | null;
  category_ar: string | null;
  price_sar: number;
  compare_at_sar: number | null;
  cover_image_path: string | null;
  stock: number;
};

export default async function StorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("store");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id,slug,name_en,name_ar,category_en,category_ar,price_sar,compare_at_sar,cover_image_path,stock",
    )
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const rows = (data ?? []) as unknown as ProductRow[];
  const products: StoreCard[] = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name_en: p.name_en,
    name_ar: p.name_ar,
    category: localeTyped === "ar" ? p.category_ar : p.category_en,
    price_sar: Number(p.price_sar),
    compare_at_sar: p.compare_at_sar !== null ? Number(p.compare_at_sar) : null,
    cover_image_path: p.cover_image_path,
    stock: p.stock,
  }));

  const categorySet = new Set<string>();
  for (const p of products) {
    if (p.category) categorySet.add(p.category);
  }
  const categories = Array.from(categorySet).sort();

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
        <StoreGrid
          products={products}
          locale={localeTyped}
          categories={categories}
          copy={{
            view: t("card.view"),
            addToCart: t("card.addToCart"),
            added: t("card.added"),
            outOfStock: t("card.outOfStock"),
            sar: t("currency.sar"),
            noResults: t("empty"),
            filterAll: t("filterAll"),
          }}
        />
      </section>
    </main>
  );
}
