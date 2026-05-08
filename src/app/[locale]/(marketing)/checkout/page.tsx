import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckoutClient } from "@/components/store/CheckoutClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("metaTitle") };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("lead")}</p>
        </header>

        <CheckoutClient
          locale={localeTyped}
          copy={{
            emptyTitle: t("empty"),
            emptyCta: t("emptyCta"),
            contactSection: t("sections.contact"),
            shippingSection: t("sections.shipping"),
            fullName: t("fields.fullName"),
            email: t("fields.email"),
            phone: t("fields.phone"),
            address: t("fields.address"),
            addressPlaceholder: t("fields.addressPlaceholder"),
            city: t("fields.city"),
            notes: t("fields.notes"),
            notesPlaceholder: t("fields.notesPlaceholder"),
            summary: t("summary.title"),
            subtotal: t("summary.subtotal"),
            shipping: t("summary.shipping"),
            shippingFree: t("summary.shippingFree"),
            total: t("summary.total"),
            placeOrder: t("submit.placeOrder"),
            placing: t("submit.placing"),
            successToast: t("submit.successToast"),
            errorGeneric: t("submit.errorGeneric"),
            errorStock: t("submit.errorStock"),
            sar: t("currency.sar"),
            paymentNote: t("paymentNote"),
          }}
        />
      </section>
    </main>
  );
}
