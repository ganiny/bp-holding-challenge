import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProjectsAdminClient } from "@/components/admin/ProjectsAdminClient";
import type { ProjectListRow, ProjectMediaItem } from "@/components/admin/ProjectsAdminClient";

export default async function AdminProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.projectsAdmin");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const [{ data: projectRows }, { data: mediaRows }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, slug, title_en, title_ar, summary_en, summary_ar, description_en, description_ar, sector, client, location_en, location_ar, year, cover_image_path, status, is_featured, sort_order, created_at, updated_at",
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("project_media")
      .select("id, project_id, file_path, thumbnail_path, caption_en, caption_ar, sort_order")
      .order("sort_order", { ascending: true }),
  ]);

  const projects = (projectRows ?? []) as ProjectListRow[];
  const allMedia = (mediaRows ?? []) as ProjectMediaItem[];

  const mediaByProject = new Map<string, ProjectMediaItem[]>();
  for (const m of allMedia) {
    const list = mediaByProject.get(m.project_id) ?? [];
    list.push(m);
    mediaByProject.set(m.project_id, list);
  }

  const enriched = projects.map((p) => ({
    ...p,
    gallery: mediaByProject.get(p.id) ?? [],
  }));

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("lead")}</p>
        </div>
      </header>

      <ProjectsAdminClient
        locale={localeTyped}
        projects={enriched}
        copy={{
          newProject: t("newProject"),
          search: t("search"),
          filterStatus: t("filterStatus"),
          statusAll: t("statusAll"),
          statusDraft: t("status.draft"),
          statusPublished: t("status.published"),
          statusArchived: t("status.archived"),
          colCover: t("table.cover"),
          colTitle: t("table.title"),
          colSector: t("table.sector"),
          colYear: t("table.year"),
          colStatus: t("table.status"),
          colMedia: t("table.media"),
          colFeatured: t("table.featured"),
          colActions: t("table.actions"),
          empty: t("empty"),
          edit: t("actions.edit"),
          publish: t("actions.publish"),
          unpublish: t("actions.unpublish"),
          archive: t("actions.archive"),
          delete: t("actions.delete"),
          confirmDeleteTitle: t("confirmDelete.title"),
          confirmDeleteBody: t("confirmDelete.body"),
          confirmDeleteCta: t("confirmDelete.cta"),
          cancel: t("actions.cancel"),
          drawerCreateTitle: t("drawer.createTitle"),
          drawerEditTitle: t("drawer.editTitle"),
          drawerSubtitle: t("drawer.subtitle"),
          formSlug: t("form.slug"),
          formSlugHint: t("form.slugHint"),
          formTitleEn: t("form.titleEn"),
          formTitleAr: t("form.titleAr"),
          formSummaryEn: t("form.summaryEn"),
          formSummaryAr: t("form.summaryAr"),
          formDescriptionEn: t("form.descriptionEn"),
          formDescriptionAr: t("form.descriptionAr"),
          formSector: t("form.sector"),
          formClient: t("form.client"),
          formLocationEn: t("form.locationEn"),
          formLocationAr: t("form.locationAr"),
          formYear: t("form.year"),
          formStatus: t("form.status"),
          formIsFeatured: t("form.isFeatured"),
          formSortOrder: t("form.sortOrder"),
          formCoverImage: t("form.coverImage"),
          formCoverImageHint: t("form.coverImageHint"),
          formCoverImageAdd: t("form.coverImageAdd"),
          formCoverImageReplace: t("form.coverImageReplace"),
          formCoverImageRemove: t("form.coverImageRemove"),
          formGallery: t("form.gallery"),
          formGalleryHint: t("form.galleryHint"),
          formGalleryAdd: t("form.galleryAdd"),
          formGalleryRemove: t("form.galleryRemove"),
          formCaptionEn: t("form.captionEn"),
          formCaptionAr: t("form.captionAr"),
          save: t("form.save"),
          saving: t("form.saving"),
          successCreated: t("toast.created"),
          successUpdated: t("toast.updated"),
          successDeleted: t("toast.deleted"),
          successStatusUpdated: t("toast.statusUpdated"),
          errorValidation: t("errors.validation"),
          errorSlugConflict: t("errors.slugConflict"),
          errorUnauthorized: t("errors.unauthorized"),
          errorGeneric: t("errors.generic"),
          featuredYes: t("featured.yes"),
          featuredNo: t("featured.no"),
        }}
      />
    </section>
  );
}
