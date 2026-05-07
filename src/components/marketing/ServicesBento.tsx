"use client";

import { useTranslations } from "next-intl";
import {
  IconHome,
  IconBuildingSkyscraper,
  IconBrush,
  IconCompass,
  IconHelmet,
  IconArrowNarrowRight,
} from "@tabler/icons-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SECTORS, type SectorId } from "@/data/sectors";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  IconHome,
  IconBuildingSkyscraper,
  IconBrush,
  IconCompass,
  IconHelmet,
} as const;

const SUMMARIES_EN: Record<SectorId, string> = {
  residential: "Turn-key villas and residential complexes built to Saudi Building Code standards.",
  structural: "Foundations, frames, and reinforced concrete for buildings and infrastructure.",
  interior: "Premium interior finishing, joinery, and bespoke design for executive spaces.",
  consulting: "Architectural, structural, and project-management consulting.",
  general: "Single point of accountability for multi-disciplinary project delivery.",
};

const SUMMARIES_AR: Record<SectorId, string> = {
  residential: "إنشاء الفلل والمجمعات السكنية بمعايير كود البناء السعودي.",
  structural: "الأساسات والهياكل والخرسانة المسلحة للمباني والبنية التحتية.",
  interior: "تشطيبات داخلية فاخرة ونجارة وتصميم مخصص للمساحات التنفيذية.",
  consulting: "استشارات معمارية وإنشائية وإدارة مشاريع.",
  general: "نقطة مساءلة واحدة لتسليم المشاريع متعددة التخصصات.",
};

const TILE_LAYOUT: Record<SectorId, string> = {
  residential: "md:col-span-2 md:row-span-2",
  structural: "md:col-span-1",
  interior: "md:col-span-1",
  consulting: "md:col-span-1",
  general: "md:col-span-2",
};

export function ServicesBento({ locale }: { locale: "ar" | "en" }) {
  const t = useTranslations("home.services");
  const tSectors = useTranslations("sectors");
  const summaries = locale === "ar" ? SUMMARIES_AR : SUMMARIES_EN;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <header className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </header>

      <BentoGrid className="md:auto-rows-[14rem]">
        {SECTORS.map((sector) => {
          const Icon = ICON_MAP[sector.iconKey as keyof typeof ICON_MAP];
          return (
            <BentoTile
              key={sector.id}
              href={`/services/${sector.serviceSlug}`}
              title={tSectors(sector.id)}
              description={summaries[sector.id]}
              icon={<Icon className="size-7 text-brand-gold" />}
              className={TILE_LAYOUT[sector.id]}
            />
          );
        })}
      </BentoGrid>

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/services">{t("viewAll")}</Link>
        </Button>
      </div>
    </section>
  );
}

function BentoTile({
  href,
  title,
  description,
  icon,
  className,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5",
        className,
      )}
    >
      <GlowingEffect glow={true} disabled={false} proximity={64} spread={32} blur={0} borderWidth={3} inactiveZone={0.05}/>
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-background/40">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <p className="mt-4 inline-flex items-center text-xs font-mono uppercase tracking-[0.18em] text-brand-gold opacity-0 transition-opacity group-hover:opacity-100">
            <IconArrowNarrowRight className="size-4 me-2 rtl:rotate-180" />
            {/* readable label is contained in the hover affordance only */}
          </p>
        </div>
      </div>
    </Link>
  );
}
