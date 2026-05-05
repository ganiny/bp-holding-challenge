import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import {
  IconCompass,
  IconBuildingStore,
  IconBuildingFactory2,
  IconUsers,
  IconMapPin,
  IconArrowRight,
} from "@tabler/icons-react";

const MILESTONE_KEYS = ["y2021", "y2022", "y2023", "y2024", "y2025", "y2026"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const milestones: TimelineEntry[] = MILESTONE_KEYS.map((k) => ({
    title: t(`milestones.${k}.title` as `milestones.y2021.title`),
    content: (
      <div>
        <h4 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {t(`milestones.${k}.heading` as `milestones.y2021.heading`)}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t(`milestones.${k}.body` as `milestones.y2021.body`)}
        </p>
      </div>
    ),
  }));

  return (
    <main className="flex flex-1 flex-col">
      {/* Page header */}
      <section className="relative isolate overflow-hidden bg-brand-navy text-brand-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-3xl text-balance text-base text-brand-cream/85 sm:text-lg">
            {t("lead")}
          </p>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-8">
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
              {t("missionTitle")}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-foreground">
              {t("missionBody")}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-8">
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
              {t("visionTitle")}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-foreground">
              {t("visionBody")}
            </p>
          </article>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-card/30">
        <Timeline data={milestones} title={t("timelineTitle")} subtitle={t("timelineSubtitle")} />
      </section>

      {/* 4 sectors */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <header className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("sectorsTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("sectorsSubtitle")}</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SectorCard icon={<IconCompass className="size-7 text-brand-gold" />} title={t("sectorEngineering")} body={t("sectorEngineeringBody")} />
          <SectorCard icon={<IconBuildingStore className="size-7 text-brand-gold" />} title={t("sectorTrade")} body={t("sectorTradeBody")} />
          <SectorCard icon={<IconBuildingFactory2 className="size-7 text-brand-gold" />} title={t("sectorIndustry")} body={t("sectorIndustryBody")} />
          <SectorCard icon={<IconUsers className="size-7 text-brand-gold" />} title={t("sectorServices")} body={t("sectorServicesBody")} />
        </div>
      </section>

      {/* Leadership */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <header className="mb-10">
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
            {t("leadershipTitle")}
          </p>
        </header>
        <article className="grid gap-8 rounded-xl border border-border bg-card p-8 sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-10">
          <div className="flex size-32 items-center justify-center rounded-xl bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy-hover text-brand-gold">
            <span className="text-4xl font-semibold tracking-tight">
              {locale === "ar" ? "أ.ش" : "AS"}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">{t("leadershipName")}</h3>
            <p className="mt-1 text-sm font-mono uppercase tracking-[0.18em] text-brand-gold">
              {t("leadershipRole")}
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              {t("leadershipBio")}
            </p>
          </div>
        </article>
      </section>

      {/* Branches */}
      <section className="bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <header className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("branchesTitle")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("branchesSubtitle")}</p>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            <BranchCard title={t("branchHQTitle")} address={t("branchHQAddress")} />
            <BranchCard title={t("branchWesternTitle")} address={t("branchWesternAddress")} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("ctaTitle")}</h2>
        <Button asChild size="lg" className="mt-8 bg-brand-navy text-brand-cream hover:bg-brand-navy-hover">
          <Link href="/rfq">
            {t("ctaButton")}
            <IconArrowRight className="ms-2 size-4 rtl:rotate-180" />
          </Link>
        </Button>
      </section>
    </main>
  );
}

function SectorCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand-gold/40">
      <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-background/40">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </article>
  );
}

function BranchCard({ title, address }: { title: string; address: string }) {
  return (
    <article className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-brand-gold">
        <IconMapPin className="size-5" />
      </div>
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
        <p className="mt-1 text-base font-medium">{address}</p>
      </div>
    </article>
  );
}
