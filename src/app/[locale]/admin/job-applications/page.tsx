import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  JobApplicationsAdminClient,
  type JobApplicationRow,
  type CareerOption,
} from "@/components/admin/JobApplicationsAdminClient";

export default async function AdminJobApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.jobApplicationsAdmin");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const [{ data: applicationRows }, { data: careerRows }] = await Promise.all([
    supabase
      .from("job_applications")
      .select(
        "id, career_id, full_name, email, phone, cover_letter, cv_file_path, portfolio_url, linkedin_url, status, notes, created_at, updated_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("careers")
      .select("id, slug, title_en, title_ar")
      .order("created_at", { ascending: false }),
  ]);

  const applications = (applicationRows ?? []) as JobApplicationRow[];
  const careers = (careerRows ?? []) as CareerOption[];

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

      <JobApplicationsAdminClient
        locale={localeTyped}
        applications={applications}
        careers={careers}
        copy={{
          search: t("search"),
          filterStatus: t("filterStatus"),
          filterRole: t("filterRole"),
          filterAll: t("filterAll"),
          exportCsv: t("exportCsv"),
          statusNew: t("status.new"),
          statusReviewing: t("status.reviewing"),
          statusShortlisted: t("status.shortlisted"),
          statusRejected: t("status.rejected"),
          statusHired: t("status.hired"),
          colCandidate: t("table.candidate"),
          colRole: t("table.role"),
          colSubmitted: t("table.submitted"),
          colStatus: t("table.status"),
          colActions: t("table.actions"),
          empty: t("empty"),
          view: t("actions.view"),
          delete: t("actions.delete"),
          cancel: t("actions.cancel"),
          confirmDeleteTitle: t("confirmDelete.title"),
          confirmDeleteBody: t("confirmDelete.body"),
          confirmDeleteCta: t("confirmDelete.cta"),
          drawerTitle: t("drawer.title"),
          drawerSubtitle: t("drawer.subtitle"),
          fieldEmail: t("fields.email"),
          fieldPhone: t("fields.phone"),
          fieldRole: t("fields.role"),
          fieldPortfolio: t("fields.portfolio"),
          fieldLinkedin: t("fields.linkedin"),
          fieldCoverLetter: t("fields.coverLetter"),
          fieldStatus: t("fields.status"),
          fieldNotes: t("fields.notes"),
          fieldNotesPlaceholder: t("fields.notesPlaceholder"),
          openCv: t("actions.openCv"),
          openingCv: t("actions.openingCv"),
          saveNotes: t("actions.saveNotes"),
          savingNotes: t("actions.savingNotes"),
          notesUnchanged: t("actions.notesUnchanged"),
          successStatusUpdated: t("toast.statusUpdated"),
          successNotesUpdated: t("toast.notesUpdated"),
          successDeleted: t("toast.deleted"),
          errorCvNotFound: t("errors.cvNotFound"),
          errorUnauthorized: t("errors.unauthorized"),
          errorGeneric: t("errors.generic"),
          notProvided: t("notProvided"),
          unknownRole: t("unknownRole"),
          csvHeaderId: t("csv.id"),
          csvHeaderName: t("csv.name"),
          csvHeaderEmail: t("csv.email"),
          csvHeaderPhone: t("csv.phone"),
          csvHeaderRole: t("csv.role"),
          csvHeaderStatus: t("csv.status"),
          csvHeaderSubmitted: t("csv.submitted"),
          csvHeaderPortfolio: t("csv.portfolio"),
          csvHeaderLinkedin: t("csv.linkedin"),
        }}
      />
    </section>
  );
}
