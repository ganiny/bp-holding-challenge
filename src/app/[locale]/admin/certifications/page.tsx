import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  CertificationsAdminClient,
  type CertificationRow,
} from "@/components/admin/CertificationsAdminClient";

export default async function AdminCertificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.certificationsAdmin");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("certifications")
    .select(
      "id, title_en, title_ar, issuer_en, issuer_ar, description_en, description_ar, file_path, thumbnail_path, visibility, issued_on, expires_on, sort_order, created_at, updated_at",
    )
    .order("sort_order", { ascending: true });

  const items = (rows ?? []) as CertificationRow[];

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

      <CertificationsAdminClient
        locale={localeTyped}
        items={items}
        copy={{
          newCert: t("newCert"),
          search: t("search"),
          filterVisibility: t("filterVisibility"),
          filterAll: t("filterAll"),
          visibilityPublic: t("visibilityPublic"),
          visibilityPrivate: t("visibilityPrivate"),
          colTitle: t("table.title"),
          colIssuer: t("table.issuer"),
          colIssued: t("table.issued"),
          colExpires: t("table.expires"),
          colVisibility: t("table.visibility"),
          colActions: t("table.actions"),
          empty: t("empty"),
          edit: t("actions.edit"),
          openFile: t("actions.openFile"),
          openingFile: t("actions.openingFile"),
          delete: t("actions.delete"),
          cancel: t("actions.cancel"),
          reorder: t("actions.reorder"),
          reorderHint: t("actions.reorderHint"),
          reorderSave: t("actions.reorderSave"),
          reorderSaving: t("actions.reorderSaving"),
          reorderCancel: t("actions.reorderCancel"),
          confirmDeleteTitle: t("confirmDelete.title"),
          confirmDeleteBody: t("confirmDelete.body"),
          confirmDeleteCta: t("confirmDelete.cta"),
          drawerCreateTitle: t("drawer.createTitle"),
          drawerEditTitle: t("drawer.editTitle"),
          drawerSubtitle: t("drawer.subtitle"),
          formTitleEn: t("form.titleEn"),
          formTitleAr: t("form.titleAr"),
          formIssuerEn: t("form.issuerEn"),
          formIssuerAr: t("form.issuerAr"),
          formDescriptionEn: t("form.descriptionEn"),
          formDescriptionAr: t("form.descriptionAr"),
          formIssuedOn: t("form.issuedOn"),
          formExpiresOn: t("form.expiresOn"),
          formVisibility: t("form.visibility"),
          formSortOrder: t("form.sortOrder"),
          formFile: t("form.file"),
          formFileHint: t("form.fileHint"),
          formFileAdd: t("form.fileAdd"),
          formFileReplace: t("form.fileReplace"),
          formThumbnail: t("form.thumbnail"),
          formThumbnailHint: t("form.thumbnailHint"),
          formThumbnailAdd: t("form.thumbnailAdd"),
          formThumbnailReplace: t("form.thumbnailReplace"),
          formThumbnailRemove: t("form.thumbnailRemove"),
          save: t("form.save"),
          saving: t("form.saving"),
          successCreated: t("toast.created"),
          successUpdated: t("toast.updated"),
          successDeleted: t("toast.deleted"),
          successVisibilityUpdated: t("toast.visibilityUpdated"),
          successReordered: t("toast.reordered"),
          errorValidation: t("errors.validation"),
          errorFileRequired: t("errors.fileRequired"),
          errorUnauthorized: t("errors.unauthorized"),
          errorFileNotFound: t("errors.fileNotFound"),
          errorGeneric: t("errors.generic"),
        }}
      />
    </section>
  );
}
