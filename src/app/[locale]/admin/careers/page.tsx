import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  CareersAdminClient,
  type CareerListRow,
} from "@/components/admin/CareersAdminClient";

export default async function AdminCareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.careersAdmin");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("careers")
    .select(
      "id, slug, title_en, title_ar, department_en, department_ar, location_en, location_ar, type_en, type_ar, description_en, description_ar, requirements_en, requirements_ar, status, closes_at, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  // Application counts per posting — one extra round-trip, kept simple.
  const { data: appRows } = await supabase
    .from("job_applications")
    .select("career_id");

  const applicationsByCareer = new Map<string, number>();
  for (const r of (appRows ?? []) as { career_id: string | null }[]) {
    if (!r.career_id) continue;
    applicationsByCareer.set(
      r.career_id,
      (applicationsByCareer.get(r.career_id) ?? 0) + 1,
    );
  }

  const careers = ((rows ?? []) as CareerListRow[]).map((c) => ({
    ...c,
    application_count: applicationsByCareer.get(c.id) ?? 0,
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

      <CareersAdminClient
        locale={localeTyped}
        careers={careers}
        copy={{
          newCareer: t("newCareer"),
          search: t("search"),
          filterStatus: t("filterStatus"),
          statusAll: t("statusAll"),
          statusDraft: t("status.draft"),
          statusOpen: t("status.open"),
          statusClosed: t("status.closed"),
          colTitle: t("table.title"),
          colDepartment: t("table.department"),
          colLocation: t("table.location"),
          colType: t("table.type"),
          colStatus: t("table.status"),
          colCloses: t("table.closes"),
          colApplications: t("table.applications"),
          colActions: t("table.actions"),
          empty: t("empty"),
          edit: t("actions.edit"),
          open: t("actions.open"),
          close: t("actions.close"),
          unpublish: t("actions.unpublish"),
          delete: t("actions.delete"),
          cancel: t("actions.cancel"),
          confirmDeleteTitle: t("confirmDelete.title"),
          confirmDeleteBody: t("confirmDelete.body"),
          confirmDeleteCta: t("confirmDelete.cta"),
          drawerCreateTitle: t("drawer.createTitle"),
          drawerEditTitle: t("drawer.editTitle"),
          drawerSubtitle: t("drawer.subtitle"),
          formSlug: t("form.slug"),
          formSlugHint: t("form.slugHint"),
          formTitleEn: t("form.titleEn"),
          formTitleAr: t("form.titleAr"),
          formDepartmentEn: t("form.departmentEn"),
          formDepartmentAr: t("form.departmentAr"),
          formLocationEn: t("form.locationEn"),
          formLocationAr: t("form.locationAr"),
          formTypeEn: t("form.typeEn"),
          formTypeAr: t("form.typeAr"),
          formDescriptionEn: t("form.descriptionEn"),
          formDescriptionAr: t("form.descriptionAr"),
          formRequirementsEn: t("form.requirementsEn"),
          formRequirementsAr: t("form.requirementsAr"),
          formStatus: t("form.status"),
          formClosesAt: t("form.closesAt"),
          formClosesAtHint: t("form.closesAtHint"),
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
          noCloseDate: t("noCloseDate"),
        }}
      />
    </section>
  );
}
