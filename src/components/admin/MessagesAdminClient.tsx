"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  formatDistanceToNow,
  parseISO,
  format as formatDate,
} from "date-fns";
import { ar as arLocale, enUS as enLocale } from "date-fns/locale";
import {
  IconSearch,
  IconEye,
  IconTrash,
  IconLoader2,
  IconDownload,
  IconSend,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  messageStatusValues,
  type MessageStatusValue,
} from "@/lib/validation/contactMessage";
import {
  setMessageStatus,
  deleteMessage,
  replyToMessage,
} from "@/app/[locale]/admin/messages/actions";
import { cn } from "@/lib/utils";

export type MessageRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: MessageStatusValue;
  created_at: string;
  updated_at: string;
};

export type MessagesAdminCopy = {
  search: string;
  filterStatus: string;
  filterAll: string;
  exportCsv: string;
  statusNew: string;
  statusRead: string;
  statusReplied: string;
  statusClosed: string;
  colSender: string;
  colSubject: string;
  colSubmitted: string;
  colStatus: string;
  colActions: string;
  empty: string;
  view: string;
  delete: string;
  cancel: string;
  confirmDeleteTitle: string;
  confirmDeleteBody: string;
  confirmDeleteCta: string;
  drawerTitle: string;
  drawerSubtitle: string;
  fieldEmail: string;
  fieldPhone: string;
  fieldSubject: string;
  fieldMessage: string;
  fieldStatus: string;
  replyTitle: string;
  replySubtitle: string;
  replySubject: string;
  replySubjectPlaceholder: string;
  replyBody: string;
  replyBodyPlaceholder: string;
  replySend: string;
  replySending: string;
  replyHint: string;
  successStatusUpdated: string;
  successDeleted: string;
  successReplySent: string;
  errorReplyFailed: string;
  errorReplyValidation: string;
  errorUnauthorized: string;
  errorGeneric: string;
  notProvided: string;
  csvHeaderId: string;
  csvHeaderName: string;
  csvHeaderEmail: string;
  csvHeaderPhone: string;
  csvHeaderSubject: string;
  csvHeaderMessage: string;
  csvHeaderStatus: string;
  csvHeaderSubmitted: string;
};

const STATUS_BADGE_CLASSES: Record<MessageStatusValue, string> = {
  new: "bg-brand-gold/15 text-brand-gold",
  read: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  replied: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  closed: "bg-muted text-muted-foreground",
};

function statusLabel(s: MessageStatusValue, copy: MessagesAdminCopy) {
  switch (s) {
    case "new":
      return copy.statusNew;
    case "read":
      return copy.statusRead;
    case "replied":
      return copy.statusReplied;
    case "closed":
      return copy.statusClosed;
  }
}

function csvEscape(v: string | number | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function MessagesAdminClient({
  messages,
  locale,
  copy,
}: {
  messages: MessageRow[];
  locale: "ar" | "en";
  copy: MessagesAdminCopy;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | MessageStatusValue
  >("all");
  const [active, setActive] = useState<MessageRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MessageRow | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const dfLocale = locale === "ar" ? arLocale : enLocale;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        m.full_name,
        m.email,
        m.phone ?? "",
        m.subject ?? "",
        m.message,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [messages, query, statusFilter]);

  function handleStatusChange(m: MessageRow, next: MessageStatusValue) {
    if (m.status === next) return;
    setPendingId(m.id);
    startTransition(async () => {
      const res = await setMessageStatus({ id: m.id, status: next }, locale);
      setPendingId(null);
      if (res.ok) toast.success(copy.successStatusUpdated);
      else if (res.code === "unauthorized")
        toast.error(copy.errorUnauthorized);
      else toast.error(copy.errorGeneric);
    });
  }

  function openDetail(m: MessageRow) {
    setActive(m);
    // Auto-bump 'new' → 'read' the first time the admin opens it.
    if (m.status === "new") {
      handleStatusChange(m, "read");
    }
  }

  function handleDeleteConfirmed() {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setPendingId(target.id);
    setConfirmDelete(null);
    startTransition(async () => {
      const res = await deleteMessage({ id: target.id }, locale);
      setPendingId(null);
      if (res.ok) {
        toast.success(copy.successDeleted);
        if (active?.id === target.id) setActive(null);
      } else if (res.code === "unauthorized")
        toast.error(copy.errorUnauthorized);
      else toast.error(copy.errorGeneric);
    });
  }

  function exportCsv() {
    const headers = [
      copy.csvHeaderId,
      copy.csvHeaderName,
      copy.csvHeaderEmail,
      copy.csvHeaderPhone,
      copy.csvHeaderSubject,
      copy.csvHeaderMessage,
      copy.csvHeaderStatus,
      copy.csvHeaderSubmitted,
    ];
    const lines = [headers.join(",")];
    for (const m of filtered) {
      lines.push(
        [
          csvEscape(m.id),
          csvEscape(m.full_name),
          csvEscape(m.email),
          csvEscape(m.phone),
          csvEscape(m.subject),
          csvEscape(m.message),
          csvEscape(statusLabel(m.status, copy)),
          csvEscape(m.created_at),
        ].join(","),
      );
    }
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const ts = formatDate(new Date(), "yyyy-MM-dd-HHmm");
    link.href = url;
    link.download = `contact-messages-${ts}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch className="absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.search}
            className="ps-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as "all" | MessageStatusValue)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={copy.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copy.filterAll}</SelectItem>
            {messageStatusValues.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s, copy)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="gap-2"
        >
          <IconDownload className="size-4" />
          {copy.exportCsv}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{copy.colSender}</TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.colSubject}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.colSubmitted}
              </TableHead>
              <TableHead>{copy.colStatus}</TableHead>
              <TableHead className="text-end">{copy.colActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {copy.empty}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => {
                const isPending = pendingId === m.id;
                const isUnread = m.status === "new";
                return (
                  <TableRow key={m.id} id={m.id}>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => openDetail(m)}
                        className="text-start"
                      >
                        <div
                          className={cn(
                            "font-medium hover:underline",
                            isUnread && "text-brand-gold",
                          )}
                        >
                          {m.full_name}
                        </div>
                        <div className="text-xs text-muted-foreground" dir="ltr">
                          {m.email}
                        </div>
                      </button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {m.subject ? (
                        <span className="line-clamp-1">{m.subject}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDistanceToNow(parseISO(m.created_at), {
                        addSuffix: true,
                        locale: dfLocale,
                      })}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={m.status}
                        onValueChange={(v) =>
                          handleStatusChange(m, v as MessageStatusValue)
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-7 w-[130px] gap-2 text-[11px] font-medium uppercase tracking-wide",
                            STATUS_BADGE_CLASSES[m.status],
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {messageStatusValues.map((s) => (
                            <SelectItem key={s} value={s}>
                              {statusLabel(s, copy)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title={copy.view}
                          onClick={() => openDetail(m)}
                        >
                          <IconEye className="size-4" />
                          <span className="sr-only">{copy.view}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title={copy.delete}
                          onClick={() => setConfirmDelete(m)}
                        >
                          <IconTrash className="size-4 text-red-600 dark:text-red-400" />
                          <span className="sr-only">{copy.delete}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DetailDrawer
        key={active?.id ?? "none"}
        message={active}
        onClose={() => setActive(null)}
        onStatusChange={(next) => active && handleStatusChange(active, next)}
        locale={locale}
        copy={copy}
      />

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{copy.confirmDeleteTitle}</DialogTitle>
            <DialogDescription>{copy.confirmDeleteBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(null)}
            >
              {copy.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirmed}
            >
              {copy.confirmDeleteCta}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailDrawer({
  message,
  onClose,
  onStatusChange,
  locale,
  copy,
}: {
  message: MessageRow | null;
  onClose: () => void;
  onStatusChange: (next: MessageStatusValue) => void;
  locale: "ar" | "en";
  copy: MessagesAdminCopy;
}) {
  const defaultSubject = message
    ? locale === "ar"
      ? `رد: ${message.subject ?? `رسالتك #${message.id.slice(0, 8)}`}`
      : `RE: ${message.subject ?? `your message #${message.id.slice(0, 8)}`}`
    : "";
  const [replySubject, setReplySubject] = useState(defaultSubject);
  const [replyBody, setReplyBody] = useState("");
  const [isSendingReply, startSendReply] = useTransition();

  function sendReply() {
    if (!message) return;
    if (replySubject.trim().length < 2 || replyBody.trim().length < 2) {
      toast.error(copy.errorReplyValidation);
      return;
    }
    startSendReply(async () => {
      const res = await replyToMessage(
        { id: message.id, subject: replySubject, body: replyBody },
        locale,
      );
      if (res.ok) {
        toast.success(copy.successReplySent);
        setReplyBody("");
      } else if (res.code === "validation") {
        toast.error(copy.errorReplyValidation);
      } else if (res.code === "send_failed") {
        toast.error(copy.errorReplyFailed);
      } else if (res.code === "unauthorized") {
        toast.error(copy.errorUnauthorized);
      } else {
        toast.error(copy.errorGeneric);
      }
    });
  }

  return (
    <Sheet open={!!message} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side={locale === "ar" ? "left" : "right"}
        className="w-full sm:max-w-xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{copy.drawerTitle}</SheetTitle>
          <SheetDescription>{copy.drawerSubtitle}</SheetDescription>
        </SheetHeader>

        {message ? (
          <div className="space-y-5 px-4 pb-6">
            <div>
              <p className="text-lg font-semibold">{message.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(parseISO(message.created_at), "PPpp", {
                  locale: locale === "ar" ? arLocale : enLocale,
                })}
              </p>
            </div>

            <div className="grid gap-3 text-sm">
              <Field label={copy.fieldEmail}>
                <a
                  href={`mailto:${message.email}`}
                  className="text-brand-navy hover:text-brand-gold dark:text-brand-cream"
                  dir="ltr"
                >
                  {message.email}
                </a>
              </Field>
              <Field label={copy.fieldPhone}>
                {message.phone ? (
                  <a
                    href={`tel:${message.phone}`}
                    className="text-brand-navy hover:text-brand-gold dark:text-brand-cream"
                    dir="ltr"
                  >
                    {message.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
              <Field label={copy.fieldSubject}>
                {message.subject || (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
            </div>

            <div>
              <Label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {copy.fieldMessage}
              </Label>
              <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                {message.message}
              </p>
            </div>

            <div>
              <Label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {copy.fieldStatus}
              </Label>
              <Select
                value={message.status}
                onValueChange={(v) =>
                  onStatusChange(v as MessageStatusValue)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {messageStatusValues.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel(s, copy)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">
                  {copy.replyTitle}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {copy.replySubtitle}
                </p>
              </div>
              <div>
                <Label
                  htmlFor="msg-reply-subject"
                  className="mb-1 block text-xs font-medium"
                >
                  {copy.replySubject}
                </Label>
                <Input
                  id="msg-reply-subject"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  placeholder={copy.replySubjectPlaceholder}
                />
              </div>
              <div>
                <Label
                  htmlFor="msg-reply-body"
                  className="mb-1 block text-xs font-medium"
                >
                  {copy.replyBody}
                </Label>
                <Textarea
                  id="msg-reply-body"
                  rows={8}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder={copy.replyBodyPlaceholder}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {copy.replyHint}
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={sendReply}
                  disabled={
                    isSendingReply ||
                    replySubject.trim().length < 2 ||
                    replyBody.trim().length < 2
                  }
                  className="gap-2"
                >
                  {isSendingReply ? (
                    <>
                      <IconLoader2 className="size-4 animate-spin" />
                      {copy.replySending}
                    </>
                  ) : (
                    <>
                      <IconSend className="size-4" />
                      {copy.replySend}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[max-content_1fr] items-baseline gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}
