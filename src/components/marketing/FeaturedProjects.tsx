"use client";

import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export type FeaturedProject = {
  slug: string;
  title: string;
  summary: string | null;
  location: string | null;
  year: number | null;
  cover: string;
};

export function FeaturedProjects({ projects }: { projects: FeaturedProject[] }) {
  const t = useTranslations("home.projects");

  if (projects.length === 0) return null;

  return (
    <section className="bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <header className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </header>

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectTile key={project.slug} project={project} viewLabel={t("viewProject")} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/portfolio">
              {t("viewAll")}
              <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ProjectTile({
  project,
  viewLabel,
}: {
  project: FeaturedProject;
  viewLabel: string;
}) {
  return (
    <CardContainer containerClassName="!py-2" className="w-full">
      <CardBody className="!h-auto !w-full max-w-md rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-2xl hover:border-brand-gold/40">
        <CardItem
          translateZ={50}
          className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-brand-navy via-brand-navy/85 to-brand-navy-hover"
        >
          {/* Placeholder gradient. Replace with ImageKitImage once cover_image_path is real. */}
          <div className="flex h-full w-full items-end p-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-brand-gold">
              {project.location ?? ""} {project.year ? `· ${project.year}` : ""}
            </span>
          </div>
        </CardItem>
        <CardItem translateZ={30} className="mt-4 w-full">
          <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
          {project.summary ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {project.summary}
            </p>
          ) : null}
        </CardItem>
        <CardItem translateZ={20} className="mt-4 w-full">
          <Link
            href={`/portfolio/${project.slug}`}
            className="inline-flex items-center text-xs font-mono uppercase tracking-[0.18em] text-brand-navy hover:text-brand-gold transition-colors dark:text-brand-cream"
          >
            {viewLabel}
            <ArrowRight className="ms-2 size-3 rtl:rotate-180" />
          </Link>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
