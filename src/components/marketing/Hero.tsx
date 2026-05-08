"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ImagesSlider } from "../ui/images-slider";
import { imageKitLoader } from "@/lib/imagekit/loader";

// Fallback hero images served from /public when no CMS slider entries exist.
const FALLBACK_IMAGES = [
  "/first-image-hero.webp",
  "/second-image-hero.webp",
  "/third-image-hero.webp",
  "/fourth-image-hero.webp",
];

export type HeroOverrides = {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  ctaPrimaryLabel?: string | null;
  ctaPrimaryHref?: string | null;
  ctaSecondaryLabel?: string | null;
  ctaSecondaryHref?: string | null;
  /** ImageKit filePath list — converted to delivery URLs at render time. */
  sliderImagePaths?: string[];
};

function pickText(override: string | null | undefined, fallback: string) {
  return override && override.trim() ? override : fallback;
}

export function Hero({ overrides }: { overrides?: HeroOverrides }) {
  const t = useTranslations("home.hero");

  const eyebrow = pickText(overrides?.eyebrow, t("eyebrow"));
  const title = pickText(overrides?.title, t("title"));
  const subtitle = pickText(overrides?.subtitle, t("subtitle"));
  const ctaPrimaryLabel = pickText(overrides?.ctaPrimaryLabel, t("ctaPrimary"));
  const ctaPrimaryHref = overrides?.ctaPrimaryHref || "/rfq";
  const ctaSecondaryLabel = pickText(
    overrides?.ctaSecondaryLabel,
    t("ctaSecondary"),
  );
  const ctaSecondaryHref = overrides?.ctaSecondaryHref || "/portfolio";

  // Convert ImageKit paths to full delivery URLs; otherwise fall back to local /public images.
  const images =
    overrides?.sliderImagePaths && overrides.sliderImagePaths.length > 0
      ? overrides.sliderImagePaths.map((p) =>
          imageKitLoader({ src: p, width: 1920, quality: 80 }),
        )
      : FALLBACK_IMAGES;

  return (
    <ImagesSlider
      className="h-[88vh] min-h-[600px]"
      images={images}
      overlayClassName="bg-gradient-to-b from-brand-navy/85 via-brand-navy/70 to-brand-navy/95"
    >
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center text-brand-cream z-100"
      >
        <span className="rounded-full border border-brand-gold/40 bg-brand-navy/50 px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.24em] text-brand-gold backdrop-blur">
          {eyebrow}
        </span>
        <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="text-balance max-w-2xl text-base text-brand-cream/85 sm:text-lg">
          {subtitle}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-brand-gold text-brand-navy hover:bg-brand-navy dark:hover:bg-brand-navy hover:text-brand-gold shadow-[0_8px_30px_rgba(223,154,19,0.35)]"
          >
            <Link href={ctaPrimaryHref}>
              {ctaPrimaryLabel}
              <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-brand-cream/40 bg-brand-navy/30 text-brand-cream backdrop-blur hover:bg-brand-cream/10 hover:text-brand-cream"
          >
            <Link href={ctaSecondaryHref}>{ctaSecondaryLabel}</Link>
          </Button>
        </div>
      </motion.div>
    </ImagesSlider>
  );
}
