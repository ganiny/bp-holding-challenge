import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/imagekit/server";
import {
  CertificationsList,
  type CertificationCard,
} from "@/components/marketing/CertificationsList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "certifications" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

function isAbsoluteOrPublic(path: string): boolean {
  return /^https?:\/\//i.test(path) || path.startsWith("/");
}

export default async function CertificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("certifications");

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("certifications")
    .select(
      "id,title_en,title_ar,issuer_en,issuer_ar,description_en,description_ar,file_path,thumbnail_path,visibility,issued_on,expires_on",
    )
    .eq("visibility", "public")
    .order("sort_order", { ascending: true });

  const items: CertificationCard[] = (rows ?? []).map((c) => {
    const fileUrl = isAbsoluteOrPublic(c.file_path)
      ? c.file_path
      : getSignedUrl(c.file_path, 600);
    const thumbnailUrl = c.thumbnail_path
      ? isAbsoluteOrPublic(c.thumbnail_path)
        ? c.thumbnail_path
        : getSignedUrl(c.thumbnail_path, 600)
      : null;
    return {
      id: c.id,
      title: locale === "ar" ? c.title_ar : c.title_en,
      issuer: locale === "ar" ? c.issuer_ar : c.issuer_en,
      description: locale === "ar" ? c.description_ar : c.description_en,
      fileUrl,
      thumbnailUrl,
      issuedOn: c.issued_on,
      expiresOn: c.expires_on,
    };
  });

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
          <p className="py-20 text-center text-muted-foreground">{t("empty")}</p>
        ) : (
          <CertificationsList
            items={items}
            locale={locale}
            copy={{
              issuedLabel: t("issuedLabel"),
              expiresLabel: t("expiresLabel"),
              issuerLabel: t("issuerLabel"),
              preview: t("preview"),
              download: t("download"),
              close: t("close"),
            }}
          />
        )}
      </section>
    </main>
  );
}
