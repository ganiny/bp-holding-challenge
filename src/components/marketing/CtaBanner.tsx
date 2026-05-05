"use client";

import { useTranslations } from "next-intl";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  const t = useTranslations("home.cta");

  return (
    <AuroraBackground className="!h-auto !min-h-[420px] !bg-brand-navy text-brand-cream">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-20%" }}
        className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center"
      >
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl text-brand-cream">
          {t("title")}
        </h2>
        <p className="text-balance text-base text-brand-cream/80 sm:text-lg">
          {t("subtitle")}
        </p>
        <Button
          asChild
          size="lg"
          className="bg-brand-gold text-brand-navy hover:bg-brand-navy dark:hover:bg-brand-navy hover:text-brand-gold shadow-[0_8px_30px_rgba(223,154,19,0.45)]"
        >
          <Link href="/rfq">
            {t("button")}
            <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
          </Link>
        </Button>
      </motion.div>
    </AuroraBackground>
  );
}
