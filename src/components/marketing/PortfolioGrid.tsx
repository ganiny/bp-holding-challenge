"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IconArrowRight, IconFilterX } from "@tabler/icons-react";
import { Image, ImageKitProvider } from "@imagekit/next";

export type PortfolioCard = {
  slug: string;
  title: string;
  summary: string;
  sector: string | null;
  sectorLabel: string;
  location: string | null;
  year: number | null;
  cover: string;
};

type FilterCopy = {
  sector: string;
  year: string;
  location: string;
  all: string;
  reset: string;
  noResults: string;
};

export function PortfolioGrid({
  projects,
  copy,
  cardCopy,
}: {
  projects: PortfolioCard[];
  copy: FilterCopy;
  cardCopy: { view: string };
}) {
  const [sector, setSector] = useState<string>("__all__");
  const [year, setYear] = useState<string>("__all__");
  const [location, setLocation] = useState<string>("__all__");

  // Build option lists from data (only non-null values).
  const sectors = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of projects) {
      if (p.sector && !map.has(p.sector)) map.set(p.sector, p.sectorLabel);
    }
    return Array.from(map, ([value, label]) => ({ value, label })).sort(
      (a, b) => a.label.localeCompare(b.label),
    );
  }, [projects]);

  const years = useMemo(
    () =>
      Array.from(
        new Set(
          projects.map((p) => p.year).filter((y): y is number => y != null),
        ),
      ).sort((a, b) => b - a),
    [projects],
  );

  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          projects.map((p) => p.location).filter((l): l is string => !!l),
        ),
      ).sort(),
    [projects],
  );

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (sector !== "__all__" && p.sector !== sector) return false;
        if (year !== "__all__" && String(p.year) !== year) return false;
        if (location !== "__all__" && p.location !== location) return false;
        return true;
      }),
    [projects, sector, year, location],
  );

  const dirty =
    sector !== "__all__" || year !== "__all__" || location !== "__all__";

  return (
    <div className="space-y-10">
      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <FilterField label={copy.sector}>
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="min-w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{copy.all}</SelectItem>
              {sectors.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={copy.year}>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="min-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{copy.all}</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={copy.location}>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="min-w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{copy.all}</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        {dirty ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSector("__all__");
              setYear("__all__");
              setLocation("__all__");
            }}
            className="ms-auto"
          >
            <IconFilterX className="me-2 size-4" />
            {copy.reset}
          </Button>
        ) : null}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          {copy.noResults}
        </p>
      ) : (
        <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProjectCard project={p} viewLabel={cardCopy.view} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function ProjectCard({
  project,
  viewLabel,
}: {
  project: PortfolioCard;
  viewLabel: string;
}) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-brand-gold/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageKitProvider
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
        >
          <Image
            src={project.cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </ImageKitProvider>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/30 to-transparent" />
        {project.sectorLabel ? (
          <Badge className="absolute end-3 top-3 bg-brand-gold/95 text-brand-navy hover:bg-brand-gold">
            {project.sectorLabel}
          </Badge>
        ) : null}
      </div>
      <div className="p-5">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {project.location ?? ""}
          {project.year ? ` · ${project.year}` : ""}
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight group-hover:text-brand-gold transition-colors">
          {project.title}
        </h3>
        {project.summary ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {project.summary}
          </p>
        ) : null}
        <p className="mt-4 inline-flex items-center text-xs font-mono uppercase tracking-[0.18em] text-brand-gold">
          {viewLabel}
          <IconArrowRight className="ms-2 size-3 rtl:rotate-180" />
        </p>
      </div>
    </Link>
  );
}
