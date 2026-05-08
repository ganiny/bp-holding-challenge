import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { IconCircleCheckFilled } from "@tabler/icons-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "orderConfirmed" });
  return { title: t("metaTitle"), robots: { index: false } };
}

type OrderRow = {
  id: string;
  order_number: string;
  full_name: string;
  email: string;
  total_sar: number;
  status: string;
  created_at: string;
};

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}) {
  const { locale, orderNumber } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("orderConfirmed");

  // Use the admin client because order RLS is admin-only by design — public
  // confirmation page just needs to echo back the order number + total to the
  // visitor who just placed it. We deliberately don't expose internal status.
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id,order_number,full_name,email,total_sar,status,created_at")
    .eq("order_number", orderNumber)
    .maybeSingle();
  const order = data as unknown as OrderRow | null;
  if (!order) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
        <IconCircleCheckFilled className="mx-auto size-16 text-brand-gold" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          {t("lead", { name: order.full_name })}
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-xl border border-border bg-card p-6 text-start">
          <dl className="space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">{t("fields.orderNumber")}</dt>
              <dd>
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  {order.order_number}
                </code>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">{t("fields.email")}</dt>
              <dd dir="ltr">{order.email}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">{t("fields.total")}</dt>
              <dd className="text-lg font-semibold text-brand-navy dark:text-brand-gold">
                {Number(order.total_sar).toFixed(2)} {t("currency.sar")}
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{t("emailNote")}</p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/store">{t("ctaContinue")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t("ctaHome")}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
