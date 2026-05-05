import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalPageShell } from "@/components/marketing/LegalPageShell";
import TermsEn from "@/content/legal/terms.en.mdx";
import TermsAr from "@/content/legal/terms.ar.mdx";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");

  const Body = locale === "ar" ? TermsAr : TermsEn;

  return (
    <LegalPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      lead={t("lead")}
    >
      <Body />
    </LegalPageShell>
  );
}
