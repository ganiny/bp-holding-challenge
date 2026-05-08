import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CartClient } from "@/components/store/CartClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return { title: t("metaTitle") };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
        </header>
        <CartClient
          locale={localeTyped}
          copy={{
            empty: t("empty"),
            emptyCta: t("emptyCta"),
            product: t("table.product"),
            price: t("table.price"),
            quantity: t("table.quantity"),
            lineTotal: t("table.lineTotal"),
            remove: t("remove"),
            subtotal: t("subtotal"),
            shippingNote: t("shippingNote"),
            checkout: t("checkout"),
            continueShopping: t("continueShopping"),
            sar: t("sar"),
          }}
        />
      </section>
    </main>
  );
}
