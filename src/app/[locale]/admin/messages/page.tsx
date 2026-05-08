import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  MessagesAdminClient,
  type MessageRow,
} from "@/components/admin/MessagesAdminClient";

export default async function AdminMessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.messagesAdmin");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("contact_messages")
    .select(
      "id, full_name, email, phone, subject, message, status, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const messages = (rows ?? []) as MessageRow[];

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

      <MessagesAdminClient
        locale={localeTyped}
        messages={messages}
        copy={{
          search: t("search"),
          filterStatus: t("filterStatus"),
          filterAll: t("filterAll"),
          exportCsv: t("exportCsv"),
          statusNew: t("status.new"),
          statusRead: t("status.read"),
          statusReplied: t("status.replied"),
          statusClosed: t("status.closed"),
          colSender: t("table.sender"),
          colSubject: t("table.subject"),
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
          fieldSubject: t("fields.subject"),
          fieldMessage: t("fields.message"),
          fieldStatus: t("fields.status"),
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
          successDeleted: t("toast.deleted"),
          successReplySent: t("toast.replySent"),
          errorReplyFailed: t("errors.replyFailed"),
          errorReplyValidation: t("errors.replyValidation"),
          errorUnauthorized: t("errors.unauthorized"),
          errorGeneric: t("errors.generic"),
          notProvided: t("notProvided"),
          csvHeaderId: t("csv.id"),
          csvHeaderName: t("csv.name"),
          csvHeaderEmail: t("csv.email"),
          csvHeaderPhone: t("csv.phone"),
          csvHeaderSubject: t("csv.subject"),
          csvHeaderMessage: t("csv.message"),
          csvHeaderStatus: t("csv.status"),
          csvHeaderSubmitted: t("csv.submitted"),
        }}
      />
    </section>
  );
}
