"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ImagesSlider } from "../ui/images-slider";

// TODO: replace with BP Holding's own engineering/construction photography.
// These are placeholder Unsplash URLs — landscape format, large enough for hero.
const HERO_IMAGES = [
  "/first-image-hero.webp",
  "/second-image-hero.webp",
  "/third-image-hero.webp",
  "/fourth-image-hero.webp",
];

export function Hero() {
  const t = useTranslations("home.hero");

  return (
    <ImagesSlider
      className="h-[88vh] min-h-[600px]"
      images={HERO_IMAGES}
      overlayClassName="bg-gradient-to-b from-brand-navy/85 via-brand-navy/70 to-brand-navy/95"
    >
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center text-brand-cream z-100"
      >
        <span className="rounded-full border border-brand-gold/40 bg-brand-navy/50 px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.24em] text-brand-gold backdrop-blur">
          {t("eyebrow")}
        </span>
        <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
        <p className="text-balance max-w-2xl text-base text-brand-cream/85 sm:text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-brand-gold text-brand-navy hover:bg-brand-navy dark:hover:bg-brand-navy hover:text-brand-gold shadow-[0_8px_30px_rgba(223,154,19,0.35)]"
          >
            <Link href="/rfq">
              {t("ctaPrimary")}
              <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-brand-cream/40 bg-brand-navy/30 text-brand-cream backdrop-blur hover:bg-brand-cream/10 hover:text-brand-cream"
          >
            <Link href="/portfolio">{t("ctaSecondary")}</Link>
          </Button>
        </div>
      </motion.div>
    </ImagesSlider>
  );
}
