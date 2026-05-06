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
  IconFileText,
  IconDownload,
  IconExternalLink,
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
  rfqStatusValues,
  type RfqStatusValue,
} from "@/lib/validation/rfqAdmin";
import {
  setRfqStatus,
  setRfqNotes,
  deleteRfq,
  getRfqAttachmentUrl,
  replyToRfq,
} from "@/app/[locale]/admin/rfqs/actions";
import { cn } from "@/lib/utils";

type BudgetValue =
  | "under_100k"
  | "100k_500k"
  | "500k_1m"
  | "1m_5m"
  | "over_5m"
  | "unspecified";

const budgetValues: BudgetValue[] = [
  "under_100k",
  "100k_500k",
  "500k_1m",
  "1m_5m",
  "over_5m",
  "unspecified",
];

export type RfqRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string | null;
  project_type: string | null;
  budget: BudgetValue;
  location: string | null;
  start_date: string | null;
  description: string;
  attachment_paths: string[];
  status: RfqStatusValue;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RfqsAdminCopy = {
  search: string;
  filterStatus: string;
  filterAll: string;
  filterBudget: string;
  exportCsv: string;
  statusNew: string;
  statusInProgress: string;
  statusQuoted: string;
  statusWon: string;
  statusLost: string;
  statusClosed: string;
  budgetUnder100k: string;
  budget100k500k: string;
  budget500k1m: string;
  budget1m5m: string;
  budgetOver5m: string;
  budgetUnspecified: string;
  colSubmitter: string;
  colProject: string;
  colBudget: string;
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
  fieldCompany: string;
  fieldProjectType: string;
  fieldBudget: string;
  fieldLocation: string;
  fieldStartDate: string;
  fieldDescription: string;
  fieldAttachments: string;
  fieldStatus: string;
  fieldNotes: string;
  fieldNotesPlaceholder: string;
  openAttachment: string;
  openingAttachment: string;
  saveNotes: string;
  savingNotes: string;
  notesUnchanged: string;
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
  successNotesUpdated: string;
  successDeleted: string;
  successReplySent: string;
  errorAttachmentNotFound: string;
  errorReplyFailed: string;
  errorReplyValidation: string;
  errorUnauthorized: string;
  errorGeneric: string;
  notProvided: string;
  attachmentLabel: string;
  csvHeaderId: string;
  csvHeaderName: string;
  csvHeaderEmail: string;
  csvHeaderPhone: string;
  csvHeaderCompany: string;
  csvHeaderProjectType: string;
  csvHeaderBudget: string;
  csvHeaderLocation: string;
  csvHeaderStartDate: string;
  csvHeaderStatus: string;
  csvHeaderSubmitted: string;
  csvHeaderAttachmentsCount: string;
};

const STATUS_BADGE_CLASSES: Record<RfqStatusValue, string> = {
  new: "bg-brand-gold/15 text-brand-gold",
  in_progress: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  quoted: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  won: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  lost: "bg-red-500/15 text-red-600 dark:text-red-400",
  closed: "bg-muted text-muted-foreground",
};

function statusLabel(s: RfqStatusValue, copy: RfqsAdminCopy) {
  switch (s) {
    case "new":
      return copy.statusNew;
    case "in_progress":
      return copy.statusInProgress;
    case "quoted":
      return copy.statusQuoted;
    case "won":
      return copy.statusWon;
    case "lost":
      return copy.statusLost;
    case "closed":
      return copy.statusClosed;
  }
}

function budgetLabel(b: BudgetValue, copy: RfqsAdminCopy) {
  switch (b) {
    case "under_100k":
      return copy.budgetUnder100k;
    case "100k_500k":
      return copy.budget100k500k;
    case "500k_1m":
      return copy.budget500k1m;
    case "1m_5m":
      return copy.budget1m5m;
    case "over_5m":
      return copy.budgetOver5m;
    case "unspecified":
      return copy.budgetUnspecified;
  }
}

function csvEscape(v: string | number | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function fileNameFromPath(p: string): string {
  const tail = p.split("/").pop() ?? p;
  return decodeURIComponent(tail);
}

export function RfqsAdminClient({
  rfqs,
  locale,
  copy,
}: {
  rfqs: RfqRow[];
  locale: "ar" | "en";
  copy: RfqsAdminCopy;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RfqStatusValue>(
    "all",
  );
  const [budgetFilter, setBudgetFilter] = useState<"all" | BudgetValue>("all");
  const [active, setActive] = useState<RfqRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<RfqRow | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const dfLocale = locale === "ar" ? arLocale : enLocale;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rfqs.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (budgetFilter !== "all" && r.budget !== budgetFilter) return false;
      if (!q) return true;
      const hay = [
        r.full_name,
        r.email,
        r.phone,
        r.company ?? "",
        r.project_type ?? "",
        r.location ?? "",
        r.description,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rfqs, query, statusFilter, budgetFilter]);

  function handleStatusChange(r: RfqRow, next: RfqStatusValue) {
    if (r.status === next) return;
    setPendingId(r.id);
    startTransition(async () => {
      const res = await setRfqStatus({ id: r.id, status: next }, locale);
      setPendingId(null);
      if (res.ok) toast.success(copy.successStatusUpdated);
      else if (res.code === "unauthorized")
        toast.error(copy.errorUnauthorized);
      else toast.error(copy.errorGeneric);
    });
  }

  function handleDeleteConfirmed() {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setPendingId(target.id);
    setConfirmDelete(null);
    startTransition(async () => {
      const res = await deleteRfq({ id: target.id }, locale);
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
      copy.csvHeaderCompany,
      copy.csvHeaderProjectType,
      copy.csvHeaderBudget,
      copy.csvHeaderLocation,
      copy.csvHeaderStartDate,
      copy.csvHeaderStatus,
      copy.csvHeaderSubmitted,
      copy.csvHeaderAttachmentsCount,
    ];
    const lines = [headers.join(",")];
    for (const r of filtered) {
      lines.push(
        [
          csvEscape(r.id),
          csvEscape(r.full_name),
          csvEscape(r.email),
          csvEscape(r.phone),
          csvEscape(r.company),
          csvEscape(r.project_type),
          csvEscape(budgetLabel(r.budget, copy)),
          csvEscape(r.location),
          csvEscape(r.start_date),
          csvEscape(statusLabel(r.status, copy)),
          csvEscape(r.created_at),
          csvEscape(r.attachment_paths.length),
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
    link.download = `rfqs-${ts}.csv`;
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
          onValueChange={(v) => setStatusFilter(v as "all" | RfqStatusValue)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={copy.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copy.filterAll}</SelectItem>
            {rfqStatusValues.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s, copy)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={budgetFilter}
          onValueChange={(v) => setBudgetFilter(v as "all" | BudgetValue)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={copy.filterBudget} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copy.filterAll}</SelectItem>
            {budgetValues.map((b) => (
              <SelectItem key={b} value={b}>
                {budgetLabel(b, copy)}
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
              <TableHead>{copy.colSubmitter}</TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.colProject}
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                {copy.colBudget}
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
                  colSpan={6}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {copy.empty}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => {
                const isPending = pendingId === r.id;
                return (
                  <TableRow key={r.id} id={r.id}>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setActive(r)}
                        className="text-start"
                      >
                        <div className="font-medium hover:underline">
                          {r.full_name}
                        </div>
                        <div className="text-xs text-muted-foreground" dir="ltr">
                          {r.email}
                          {r.company ? ` · ${r.company}` : ""}
                        </div>
                      </button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {r.project_type ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {budgetLabel(r.budget, copy)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDistanceToNow(parseISO(r.created_at), {
                        addSuffix: true,
                        locale: dfLocale,
                      })}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.status}
                        onValueChange={(v) =>
                          handleStatusChange(r, v as RfqStatusValue)
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-7 w-[140px] gap-2 text-[11px] font-medium uppercase tracking-wide",
                            STATUS_BADGE_CLASSES[r.status],
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rfqStatusValues.map((s) => (
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
                          onClick={() => setActive(r)}
                        >
                          <IconEye className="size-4" />
                          <span className="sr-only">{copy.view}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title={copy.delete}
                          onClick={() => setConfirmDelete(r)}
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
        rfq={active}
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
  rfq,
  onClose,
  onStatusChange,
  locale,
  copy,
}: {
  rfq: RfqRow | null;
  onClose: () => void;
  onStatusChange: (next: RfqStatusValue) => void;
  locale: "ar" | "en";
  copy: RfqsAdminCopy;
}) {
  const [notes, setNotes] = useState(rfq?.internal_notes ?? "");
  const [openingIdx, setOpeningIdx] = useState<number | null>(null);
  const [, startDocOpen] = useTransition();
  const [isSavingNotes, startSaveNotes] = useTransition();

  // Reply form
  const defaultSubject = rfq
    ? locale === "ar"
      ? `رد على طلب عرض السعر #${rfq.id.slice(0, 8)}`
      : `RE: Your quote request #${rfq.id.slice(0, 8)}`
    : "";
  const [replySubject, setReplySubject] = useState(defaultSubject);
  const [replyBody, setReplyBody] = useState("");
  const [isSendingReply, startSendReply] = useTransition();

  const initialNotes = rfq?.internal_notes ?? "";
  const notesChanged = notes !== initialNotes;

  function openAttachment(index: number) {
    if (!rfq) return;
    setOpeningIdx(index);
    startDocOpen(async () => {
      const res = await getRfqAttachmentUrl({ id: rfq.id, index });
      setOpeningIdx(null);
      if (res.ok) {
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      } else if (res.code === "not_found") {
        toast.error(copy.errorAttachmentNotFound);
      } else if (res.code === "unauthorized") {
        toast.error(copy.errorUnauthorized);
      } else {
        toast.error(copy.errorGeneric);
      }
    });
  }

  function saveNotes() {
    if (!rfq) return;
    startSaveNotes(async () => {
      const res = await setRfqNotes({ id: rfq.id, notes }, locale);
      if (res.ok) toast.success(copy.successNotesUpdated);
      else if (res.code === "unauthorized") toast.error(copy.errorUnauthorized);
      else toast.error(copy.errorGeneric);
    });
  }

  function sendReply() {
    if (!rfq) return;
    if (replySubject.trim().length < 2 || replyBody.trim().length < 2) {
      toast.error(copy.errorReplyValidation);
      return;
    }
    startSendReply(async () => {
      const res = await replyToRfq(
        { id: rfq.id, subject: replySubject, body: replyBody },
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

  const fmtDate = (iso: string | null) => {
    if (!iso) return null;
    try {
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <Sheet open={!!rfq} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side={locale === "ar" ? "left" : "right"}
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{copy.drawerTitle}</SheetTitle>
          <SheetDescription>{copy.drawerSubtitle}</SheetDescription>
        </SheetHeader>

        {rfq ? (
          <div className="space-y-5 px-4 pb-6">
            <div>
              <p className="text-lg font-semibold">{rfq.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(parseISO(rfq.created_at), "PPpp", {
                  locale: locale === "ar" ? arLocale : enLocale,
                })}
              </p>
            </div>

            <div className="grid gap-3 text-sm">
              <Field label={copy.fieldEmail}>
                <a
                  href={`mailto:${rfq.email}`}
                  className="text-brand-navy hover:text-brand-gold dark:text-brand-cream"
                  dir="ltr"
                >
                  {rfq.email}
                </a>
              </Field>
              <Field label={copy.fieldPhone}>
                <a
                  href={`tel:${rfq.phone}`}
                  className="text-brand-navy hover:text-brand-gold dark:text-brand-cream"
                  dir="ltr"
                >
                  {rfq.phone}
                </a>
              </Field>
              <Field label={copy.fieldCompany}>
                {rfq.company || (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
              <Field label={copy.fieldProjectType}>
                {rfq.project_type || (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
              <Field label={copy.fieldBudget}>
                {budgetLabel(rfq.budget, copy)}
              </Field>
              <Field label={copy.fieldLocation}>
                {rfq.location || (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
              <Field label={copy.fieldStartDate}>
                {fmtDate(rfq.start_date) || (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
            </div>

            <div>
              <Label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {copy.fieldDescription}
              </Label>
              <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                {rfq.description}
              </p>
            </div>

            <div>
              <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {copy.fieldAttachments}
              </Label>
              {rfq.attachment_paths.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {copy.notProvided}
                </p>
              ) : (
                <ul className="space-y-2">
                  {rfq.attachment_paths.map((p, idx) => {
                    const isOpening = openingIdx === idx;
                    return (
                      <li
                        key={`${p}-${idx}`}
                        className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2"
                      >
                        <IconFileText className="size-4 shrink-0 text-muted-foreground" />
                        <span
                          className="flex-1 min-w-0 truncate text-xs"
                          dir="ltr"
                          title={p}
                        >
                          {fileNameFromPath(p)}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openAttachment(idx)}
                          disabled={isOpening}
                          className="gap-1.5"
                        >
                          {isOpening ? (
                            <>
                              <IconLoader2 className="size-3.5 animate-spin" />
                              {copy.openingAttachment}
                            </>
                          ) : (
                            <>
                              <IconExternalLink className="size-3.5" />
                              {copy.openAttachment}
                            </>
                          )}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <Label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {copy.fieldStatus}
              </Label>
              <Select
                value={rfq.status}
                onValueChange={(v) => onStatusChange(v as RfqStatusValue)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rfqStatusValues.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel(s, copy)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="rfq-notes"
                className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {copy.fieldNotes}
              </Label>
              <Textarea
                id="rfq-notes"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={copy.fieldNotesPlaceholder}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={saveNotes}
                  disabled={!notesChanged || isSavingNotes}
                >
                  {isSavingNotes ? (
                    <>
                      <IconLoader2 className="size-4 animate-spin" />
                      {copy.savingNotes}
                    </>
                  ) : notesChanged ? (
                    copy.saveNotes
                  ) : (
                    copy.notesUnchanged
                  )}
                </Button>
              </div>
            </div>

            {/* Reply form */}
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
                  htmlFor="rfq-reply-subject"
                  className="mb-1 block text-xs font-medium"
                >
                  {copy.replySubject}
                </Label>
                <Input
                  id="rfq-reply-subject"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  placeholder={copy.replySubjectPlaceholder}
                />
              </div>
              <div>
                <Label
                  htmlFor="rfq-reply-body"
                  className="mb-1 block text-xs font-medium"
                >
                  {copy.replyBody}
                </Label>
                <Textarea
                  id="rfq-reply-body"
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
