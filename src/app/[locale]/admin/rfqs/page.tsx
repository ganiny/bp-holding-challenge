import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  RfqsAdminClient,
  type RfqRow,
} from "@/components/admin/RfqsAdminClient";

export default async function AdminRfqsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.rfqsAdmin");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("rfqs")
    .select(
      "id, full_name, email, phone, company, project_type, budget, location, start_date, description, attachment_paths, status, internal_notes, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const rfqs = (rows ?? []) as RfqRow[];

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

      <RfqsAdminClient
        locale={localeTyped}
        rfqs={rfqs}
        copy={{
          search: t("search"),
          filterStatus: t("filterStatus"),
          filterAll: t("filterAll"),
          filterBudget: t("filterBudget"),
          exportCsv: t("exportCsv"),
          statusNew: t("status.new"),
          statusInProgress: t("status.in_progress"),
          statusQuoted: t("status.quoted"),
          statusWon: t("status.won"),
          statusLost: t("status.lost"),
          statusClosed: t("status.closed"),
          budgetUnder100k: t("budget.under_100k"),
          budget100k500k: t("budget.100k_500k"),
          budget500k1m: t("budget.500k_1m"),
          budget1m5m: t("budget.1m_5m"),
          budgetOver5m: t("budget.over_5m"),
          budgetUnspecified: t("budget.unspecified"),
          colSubmitter: t("table.submitter"),
          colProject: t("table.project"),
          colBudget: t("table.budget"),
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
          fieldCompany: t("fields.company"),
          fieldProjectType: t("fields.projectType"),
          fieldBudget: t("fields.budget"),
          fieldLocation: t("fields.location"),
          fieldStartDate: t("fields.startDate"),
          fieldDescription: t("fields.description"),
          fieldAttachments: t("fields.attachments"),
          fieldStatus: t("fields.status"),
          fieldNotes: t("fields.notes"),
          fieldNotesPlaceholder: t("fields.notesPlaceholder"),
          openAttachment: t("actions.openAttachment"),
          openingAttachment: t("actions.openingAttachment"),
          saveNotes: t("actions.saveNotes"),
          savingNotes: t("actions.savingNotes"),
          notesUnchanged: t("actions.notesUnchanged"),
          replyTitle: t("reply.title"),
          replySubtitle: t("reply.subtitle"),
          replySubject: t("reply.subject"),
          replySubjectPlaceholder: t("reply.subjectPlaceholder"),
          replyBody: t("reply.body"),
          replyBodyPlaceholder: t("reply.bodyPlaceholder"),
          replySend: t("reply.send"),
          replySending: t("reply.sending"),
          replyHint: t("reply.hint"),
          successStatusUpdated: t("toast.statusUpdated"),
          successNotesUpdated: t("toast.notesUpdated"),
          successDeleted: t("toast.deleted"),
          successReplySent: t("toast.replySent"),
          errorAttachmentNotFound: t("errors.attachmentNotFound"),
          errorReplyFailed: t("errors.replyFailed"),
          errorReplyValidation: t("errors.replyValidation"),
          errorUnauthorized: t("errors.unauthorized"),
          errorGeneric: t("errors.generic"),
          notProvided: t("notProvided"),
          attachmentLabel: t("attachmentLabel"),
          csvHeaderId: t("csv.id"),
          csvHeaderName: t("csv.name"),
          csvHeaderEmail: t("csv.email"),
          csvHeaderPhone: t("csv.phone"),
          csvHeaderCompany: t("csv.company"),
          csvHeaderProjectType: t("csv.projectType"),
          csvHeaderBudget: t("csv.budget"),
          csvHeaderLocation: t("csv.location"),
          csvHeaderStartDate: t("csv.startDate"),
          csvHeaderStatus: t("csv.status"),
          csvHeaderSubmitted: t("csv.submitted"),
          csvHeaderAttachmentsCount: t("csv.attachmentsCount"),
        }}
      />
    </section>
  );
}
