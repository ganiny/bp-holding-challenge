import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";

type ProductRow = {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  category_en: string | null;
  category_ar: string | null;
  price_sar: number;
  compare_at_sar: number | null;
  cover_image_path: string | null;
  gallery_paths: string[];
  stock: number;
};

async function loadProduct(slug: string): Promise<ProductRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id,slug,name_en,name_ar,description_en,description_ar,category_en,category_ar,price_sar,compare_at_sar,cover_image_path,gallery_paths,stock,status",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as unknown as ProductRow | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return {};
  return {
    title: locale === "ar" ? product.name_ar : product.name_en,
    description:
      (locale === "ar" ? product.description_ar : product.description_en) ??
      undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("store");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const product = await loadProduct(slug);
  if (!product) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <ProductDetailClient
          product={{
            id: product.id,
            slug: product.slug,
            name_en: product.name_en,
            name_ar: product.name_ar,
            description:
              localeTyped === "ar"
                ? product.description_ar
                : product.description_en,
            category:
              localeTyped === "ar" ? product.category_ar : product.category_en,
            price_sar: Number(product.price_sar),
            compare_at_sar:
              product.compare_at_sar !== null
                ? Number(product.compare_at_sar)
                : null,
            cover_image_path: product.cover_image_path,
            gallery_paths: product.gallery_paths ?? [],
            stock: product.stock,
          }}
          locale={localeTyped}
          copy={{
            addToCart: t("card.addToCart"),
            added: t("card.added"),
            outOfStock: t("card.outOfStock"),
            sar: t("currency.sar"),
            inStock: t("detail.inStock"),
            quantity: t("detail.quantity"),
            buyNow: t("detail.buyNow"),
          }}
        />
      </section>
    </main>
  );
}
