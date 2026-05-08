import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  StudioAdminClient,
  type StudioRow,
} from "@/components/admin/StudioAdminClient";

export default async function AdminStudioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.studioAdmin");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("media_studio")
    .select(
      "id, kind, file_path, thumbnail_path, caption_en, caption_ar, tags, visibility, sort_order, created_at",
    )
    .order("sort_order", { ascending: true });

  const items = (rows ?? []) as StudioRow[];

  // All distinct tags so the "filter by tag" UI has a stable list to chip from.
  const tagSet = new Set<string>();
  for (const it of items) for (const t of it.tags ?? []) tagSet.add(t);
  const allTags = Array.from(tagSet).sort();

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

      <StudioAdminClient
        locale={localeTyped}
        items={items}
        allTags={allTags}
        copy={{
          uploadTitle: t("uploadTitle"),
          uploadSubtitle: t("uploadSubtitle"),
          uploadAdd: t("uploadAdd"),
          uploadVisibility: t("uploadVisibility"),
          uploadVisibilityPublic: t("uploadVisibilityPublic"),
          uploadVisibilityPrivate: t("uploadVisibilityPrivate"),
          uploadTags: t("uploadTags"),
          uploadTagsHint: t("uploadTagsHint"),
          uploadTagsPlaceholder: t("uploadTagsPlaceholder"),
          uploadStaged: t("uploadStaged"),
          uploadConfirm: t("uploadConfirm"),
          uploadConfirming: t("uploadConfirming"),
          uploadDiscard: t("uploadDiscard"),
          filterTags: t("filterTags"),
          filterAll: t("filterAll"),
          filterVisibility: t("filterVisibility"),
          reorder: t("reorder"),
          reorderHint: t("reorderHint"),
          reorderSave: t("reorderSave"),
          reorderSaving: t("reorderSaving"),
          reorderCancel: t("reorderCancel"),
          empty: t("empty"),
          edit: t("edit"),
          delete: t("delete"),
          confirmDeleteTitle: t("confirmDeleteTitle"),
          confirmDeleteBody: t("confirmDeleteBody"),
          confirmDeleteCta: t("confirmDeleteCta"),
          cancel: t("cancel"),
          editTitle: t("editTitle"),
          editSubtitle: t("editSubtitle"),
          formCaptionEn: t("formCaptionEn"),
          formCaptionAr: t("formCaptionAr"),
          formTags: t("formTags"),
          formTagsHint: t("formTagsHint"),
          formVisibility: t("formVisibility"),
          save: t("save"),
          saving: t("saving"),
          successCreated: t("successCreated"),
          successUpdated: t("successUpdated"),
          successDeleted: t("successDeleted"),
          successReordered: t("successReordered"),
          errorValidation: t("errorValidation"),
          errorUnauthorized: t("errorUnauthorized"),
          errorGeneric: t("errorGeneric"),
          visibilityPublic: t("visibilityPublic"),
          visibilityPrivate: t("visibilityPrivate"),
          uploadVideoPosterAdd: t("uploadVideoPosterAdd"),
          uploadVideoPosterReplace: t("uploadVideoPosterReplace"),
          uploadVideoPosterRemove: t("uploadVideoPosterRemove"),
          uploadVideoPosterHint: t("uploadVideoPosterHint"),
          editImageReplace: t("editImageReplace"),
          editVideoReplace: t("editVideoReplace"),
          editVideoPoster: t("editVideoPoster"),
          editVideoPosterReplace: t("editVideoPosterReplace"),
          editVideoPosterAdd: t("editVideoPosterAdd"),
          editVideoPosterRemove: t("editVideoPosterRemove"),
        }}
      />
    </section>
  );
}
