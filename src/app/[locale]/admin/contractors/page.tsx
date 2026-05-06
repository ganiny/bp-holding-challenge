import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ContractorsAdminClient,
  type ContractorApplicationRow,
} from "@/components/admin/ContractorsAdminClient";

export default async function AdminContractorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.contractorsAdmin");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("contractor_applications")
    .select(
      "id, company_name, contact_name, email, phone, country, city, cr_number, vat_number, specialty_en, specialty_ar, years_experience, website, document_paths, notes, status, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const applications = (rows ?? []) as ContractorApplicationRow[];

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

      <ContractorsAdminClient
        locale={localeTyped}
        applications={applications}
        copy={{
          search: t("search"),
          filterStatus: t("filterStatus"),
          filterAll: t("filterAll"),
          exportCsv: t("exportCsv"),
          statusNew: t("status.new"),
          statusReviewing: t("status.reviewing"),
          statusApproved: t("status.approved"),
          statusRejected: t("status.rejected"),
          colCompany: t("table.company"),
          colContact: t("table.contact"),
          colSpecialty: t("table.specialty"),
          colLocation: t("table.location"),
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
          fieldContactName: t("fields.contactName"),
          fieldEmail: t("fields.email"),
          fieldPhone: t("fields.phone"),
          fieldLocation: t("fields.location"),
          fieldCr: t("fields.cr"),
          fieldVat: t("fields.vat"),
          fieldYears: t("fields.years"),
          fieldSpecialty: t("fields.specialty"),
          fieldWebsite: t("fields.website"),
          fieldDocuments: t("fields.documents"),
          fieldStatus: t("fields.status"),
          fieldNotes: t("fields.notes"),
          fieldNotesPlaceholder: t("fields.notesPlaceholder"),
          openDocument: t("actions.openDocument"),
          openingDocument: t("actions.openingDocument"),
          saveNotes: t("actions.saveNotes"),
          savingNotes: t("actions.savingNotes"),
          notesUnchanged: t("actions.notesUnchanged"),
          successStatusUpdated: t("toast.statusUpdated"),
          successNotesUpdated: t("toast.notesUpdated"),
          successDeleted: t("toast.deleted"),
          errorDocumentNotFound: t("errors.documentNotFound"),
          errorUnauthorized: t("errors.unauthorized"),
          errorGeneric: t("errors.generic"),
          notProvided: t("notProvided"),
          documentLabel: t("documentLabel"),
          yearsLabel: t("yearsLabel"),
          csvHeaderId: t("csv.id"),
          csvHeaderCompany: t("csv.company"),
          csvHeaderContact: t("csv.contact"),
          csvHeaderEmail: t("csv.email"),
          csvHeaderPhone: t("csv.phone"),
          csvHeaderLocation: t("csv.location"),
          csvHeaderCr: t("csv.cr"),
          csvHeaderVat: t("csv.vat"),
          csvHeaderSpecialty: t("csv.specialty"),
          csvHeaderYears: t("csv.years"),
          csvHeaderStatus: t("csv.status"),
          csvHeaderSubmitted: t("csv.submitted"),
          csvHeaderWebsite: t("csv.website"),
          csvHeaderDocumentsCount: t("csv.documentsCount"),
        }}
      />
    </section>
  );
}
