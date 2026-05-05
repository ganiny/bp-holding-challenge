import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalPageShell } from "@/components/marketing/LegalPageShell";
import PrivacyEn from "@/content/legal/privacy.en.mdx";
import PrivacyAr from "@/content/legal/privacy.ar.mdx";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  const Body = locale === "ar" ? PrivacyAr : PrivacyEn;

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
