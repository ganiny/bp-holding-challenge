import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { CompanyProfileViewer } from "@/components/marketing/CompanyProfileViewer";
import { Button } from "@/components/ui/button";
import {
  IconArrowRight,
  IconDownload,
  IconFileTypePdf,
} from "@tabler/icons-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "companyProfile" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function CompanyProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("companyProfile");

  const fileLocale = locale === "ar" ? "ar" : "en";
  const fileUrl = `/documents/company-profile-${fileLocale}.pdf`;
  const fileName = `BP-Holding-Company-Profile-${fileLocale.toUpperCase()}.pdf`;

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-brand-navy text-brand-cream">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-base text-brand-cream/85 sm:text-lg">
            {t("lead")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
            >
              <a href={fileUrl} download={fileName}>
                <IconDownload className="size-4" />
                {t("downloadCta")}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-brand-cream/30 bg-transparent text-brand-cream hover:bg-brand-cream/10 hover:text-brand-cream"
            >
              <Link href="/contact">
                {t("contactCta")}
                <IconArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
            <IconFileTypePdf className="size-5" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("viewerTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("viewerSubtitle")}
            </p>
          </div>
        </div>

        <CompanyProfileViewer
          fileUrl={fileUrl}
          fileName={fileName}
          locale={fileLocale}
          copy={{
            loading: t("viewer.loading"),
            loadError: t("viewer.loadError"),
            retry: t("viewer.retry"),
            pageOf: t("viewer.pageOf"),
            previous: t("viewer.previous"),
            next: t("viewer.next"),
            zoomIn: t("viewer.zoomIn"),
            zoomOut: t("viewer.zoomOut"),
            download: t("viewer.download"),
            openExternal: t("viewer.openExternal"),
          }}
        />
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-6 sm:p-8">
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t("ctaTitle")}
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {t("ctaBody")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand-navy text-brand-cream hover:bg-brand-navy-hover"
            >
              <Link href="/rfq">
                {t("ctaPrimary")}
                <IconArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">{t("ctaSecondary")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
