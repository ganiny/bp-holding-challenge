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
  IconWorld,
  IconDownload,
  IconExternalLink,
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
  contractorStatusValues,
  type ContractorStatusValue,
} from "@/lib/validation/contractorApplication";
import {
  setContractorStatus,
  setContractorNotes,
  deleteContractor,
  getContractorDocumentUrl,
} from "@/app/[locale]/admin/contractors/actions";
import { cn } from "@/lib/utils";

export type ContractorApplicationRow = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  country: string | null;
  city: string | null;
  cr_number: string | null;
  vat_number: string | null;
  specialty_en: string | null;
  specialty_ar: string | null;
  years_experience: number | null;
  website: string | null;
  document_paths: string[];
  notes: string | null;
  status: ContractorStatusValue;
  created_at: string;
  updated_at: string;
};

export type ContractorsAdminCopy = {
  search: string;
  filterStatus: string;
  filterAll: string;
  exportCsv: string;
  statusNew: string;
  statusReviewing: string;
  statusApproved: string;
  statusRejected: string;
  colCompany: string;
  colContact: string;
  colSpecialty: string;
  colLocation: string;
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
  fieldContactName: string;
  fieldEmail: string;
  fieldPhone: string;
  fieldLocation: string;
  fieldCr: string;
  fieldVat: string;
  fieldYears: string;
  fieldSpecialty: string;
  fieldWebsite: string;
  fieldDocuments: string;
  fieldStatus: string;
  fieldNotes: string;
  fieldNotesPlaceholder: string;
  openDocument: string;
  openingDocument: string;
  saveNotes: string;
  savingNotes: string;
  notesUnchanged: string;
  successStatusUpdated: string;
  successNotesUpdated: string;
  successDeleted: string;
  errorDocumentNotFound: string;
  errorUnauthorized: string;
  errorGeneric: string;
  notProvided: string;
  documentLabel: string;
  yearsLabel: string;
  csvHeaderId: string;
  csvHeaderCompany: string;
  csvHeaderContact: string;
  csvHeaderEmail: string;
  csvHeaderPhone: string;
  csvHeaderLocation: string;
  csvHeaderCr: string;
  csvHeaderVat: string;
  csvHeaderSpecialty: string;
  csvHeaderYears: string;
  csvHeaderStatus: string;
  csvHeaderSubmitted: string;
  csvHeaderWebsite: string;
  csvHeaderDocumentsCount: string;
};

const STATUS_BADGE_CLASSES: Record<ContractorStatusValue, string> = {
  new: "bg-brand-gold/15 text-brand-gold",
  reviewing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

function statusLabel(s: ContractorStatusValue, copy: ContractorsAdminCopy) {
  switch (s) {
    case "new":
      return copy.statusNew;
    case "reviewing":
      return copy.statusReviewing;
    case "approved":
      return copy.statusApproved;
    case "rejected":
      return copy.statusRejected;
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

export function ContractorsAdminClient({
  applications,
  locale,
  copy,
}: {
  applications: ContractorApplicationRow[];
  locale: "ar" | "en";
  copy: ContractorsAdminCopy;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | ContractorStatusValue
  >("all");
  const [active, setActive] = useState<ContractorApplicationRow | null>(null);
  const [confirmDelete, setConfirmDelete] =
    useState<ContractorApplicationRow | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const dfLocale = locale === "ar" ? arLocale : enLocale;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        a.company_name,
        a.contact_name,
        a.email,
        a.phone,
        a.country ?? "",
        a.city ?? "",
        a.specialty_en ?? "",
        a.specialty_ar ?? "",
        a.cr_number ?? "",
        a.vat_number ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [applications, query, statusFilter]);

  function specialtyText(a: ContractorApplicationRow) {
    return locale === "ar"
      ? (a.specialty_ar ?? a.specialty_en ?? "")
      : (a.specialty_en ?? a.specialty_ar ?? "");
  }

  function locationText(a: ContractorApplicationRow) {
    const parts = [a.city, a.country].filter(Boolean);
    return parts.join(", ");
  }

  function handleStatusChange(
    a: ContractorApplicationRow,
    next: ContractorStatusValue,
  ) {
    if (a.status === next) return;
    setPendingId(a.id);
    startTransition(async () => {
      const res = await setContractorStatus({ id: a.id, status: next }, locale);
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
      const res = await deleteContractor({ id: target.id }, locale);
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
      copy.csvHeaderCompany,
      copy.csvHeaderContact,
      copy.csvHeaderEmail,
      copy.csvHeaderPhone,
      copy.csvHeaderLocation,
      copy.csvHeaderCr,
      copy.csvHeaderVat,
      copy.csvHeaderSpecialty,
      copy.csvHeaderYears,
      copy.csvHeaderStatus,
      copy.csvHeaderSubmitted,
      copy.csvHeaderWebsite,
      copy.csvHeaderDocumentsCount,
    ];
    const lines = [headers.join(",")];
    for (const a of filtered) {
      lines.push(
        [
          csvEscape(a.id),
          csvEscape(a.company_name),
          csvEscape(a.contact_name),
          csvEscape(a.email),
          csvEscape(a.phone),
          csvEscape(locationText(a)),
          csvEscape(a.cr_number),
          csvEscape(a.vat_number),
          csvEscape(specialtyText(a)),
          csvEscape(a.years_experience),
          csvEscape(statusLabel(a.status, copy)),
          csvEscape(a.created_at),
          csvEscape(a.website),
          csvEscape(a.document_paths.length),
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
    link.download = `contractor-applications-${ts}.csv`;
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
            setStatusFilter(v as "all" | ContractorStatusValue)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={copy.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copy.filterAll}</SelectItem>
            {contractorStatusValues.map((s) => (
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
              <TableHead>{copy.colCompany}</TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.colContact}
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                {copy.colSpecialty}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.colLocation}
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
                  colSpan={7}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {copy.empty}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => {
                const isPending = pendingId === a.id;
                return (
                  <TableRow key={a.id} id={a.id}>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setActive(a)}
                        className="text-start"
                      >
                        <div className="font-medium hover:underline">
                          {a.company_name}
                        </div>
                        <div
                          className="text-xs text-muted-foreground"
                          dir="ltr"
                        >
                          {a.email}
                        </div>
                      </button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      <div>{a.contact_name}</div>
                      <div
                        className="text-xs text-muted-foreground"
                        dir="ltr"
                      >
                        {a.phone}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {specialtyText(a) || "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {locationText(a) || "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDistanceToNow(parseISO(a.created_at), {
                        addSuffix: true,
                        locale: dfLocale,
                      })}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={a.status}
                        onValueChange={(v) =>
                          handleStatusChange(a, v as ContractorStatusValue)
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-7 w-[140px] gap-2 text-[11px] font-medium uppercase tracking-wide",
                            STATUS_BADGE_CLASSES[a.status],
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {contractorStatusValues.map((s) => (
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
                          onClick={() => setActive(a)}
                        >
                          <IconEye className="size-4" />
                          <span className="sr-only">{copy.view}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title={copy.delete}
                          onClick={() => setConfirmDelete(a)}
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
        application={active}
        specialty={active ? specialtyText(active) : ""}
        location={active ? locationText(active) : ""}
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
  application,
  specialty,
  location,
  onClose,
  onStatusChange,
  locale,
  copy,
}: {
  application: ContractorApplicationRow | null;
  specialty: string;
  location: string;
  onClose: () => void;
  onStatusChange: (next: ContractorStatusValue) => void;
  locale: "ar" | "en";
  copy: ContractorsAdminCopy;
}) {
  const [notes, setNotes] = useState(application?.notes ?? "");
  const [openingIdx, setOpeningIdx] = useState<number | null>(null);
  const [, startDocOpen] = useTransition();
  const [isSavingNotes, startSaveNotes] = useTransition();

  const initialNotes = application?.notes ?? "";
  const notesChanged = notes !== initialNotes;

  function openDocument(index: number) {
    if (!application) return;
    setOpeningIdx(index);
    startDocOpen(async () => {
      const res = await getContractorDocumentUrl({
        id: application.id,
        index,
      });
      setOpeningIdx(null);
      if (res.ok) {
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      } else if (res.code === "not_found") {
        toast.error(copy.errorDocumentNotFound);
      } else if (res.code === "unauthorized") {
        toast.error(copy.errorUnauthorized);
      } else {
        toast.error(copy.errorGeneric);
      }
    });
  }

  function saveNotes() {
    if (!application) return;
    startSaveNotes(async () => {
      const res = await setContractorNotes(
        { id: application.id, notes },
        locale,
      );
      if (res.ok) toast.success(copy.successNotesUpdated);
      else if (res.code === "unauthorized") toast.error(copy.errorUnauthorized);
      else toast.error(copy.errorGeneric);
    });
  }

  return (
    <Sheet open={!!application} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side={locale === "ar" ? "left" : "right"}
        className="w-full sm:max-w-xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{copy.drawerTitle}</SheetTitle>
          <SheetDescription>{copy.drawerSubtitle}</SheetDescription>
        </SheetHeader>

        {application ? (
          <div className="space-y-5 px-4 pb-6">
            <div>
              <p className="text-lg font-semibold">{application.company_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(parseISO(application.created_at), "PPpp", {
                  locale: locale === "ar" ? arLocale : enLocale,
                })}
              </p>
            </div>

            <div className="grid gap-3 text-sm">
              <Field label={copy.fieldContactName}>
                {application.contact_name}
              </Field>
              <Field label={copy.fieldEmail}>
                <a
                  href={`mailto:${application.email}`}
                  className="text-brand-navy hover:text-brand-gold dark:text-brand-cream"
                  dir="ltr"
                >
                  {application.email}
                </a>
              </Field>
              <Field label={copy.fieldPhone}>
                <a
                  href={`tel:${application.phone}`}
                  className="text-brand-navy hover:text-brand-gold dark:text-brand-cream"
                  dir="ltr"
                >
                  {application.phone}
                </a>
              </Field>
              <Field label={copy.fieldLocation}>
                {location || (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
              <Field label={copy.fieldSpecialty}>
                {specialty || (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
              <Field label={copy.fieldYears}>
                {application.years_experience != null ? (
                  `${application.years_experience} ${copy.yearsLabel}`
                ) : (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
              <Field label={copy.fieldCr}>
                {application.cr_number || (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
              <Field label={copy.fieldVat}>
                {application.vat_number || (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
              <Field label={copy.fieldWebsite}>
                {application.website ? (
                  <a
                    href={application.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-navy hover:text-brand-gold dark:text-brand-cream"
                    dir="ltr"
                  >
                    <IconWorld className="size-3.5" />
                    {application.website}
                    <IconExternalLink className="size-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
            </div>

            <div>
              <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {copy.fieldDocuments}
              </Label>
              {application.document_paths.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {copy.notProvided}
                </p>
              ) : (
                <ul className="space-y-2">
                  {application.document_paths.map((p, idx) => {
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
                          onClick={() => openDocument(idx)}
                          disabled={isOpening}
                          className="gap-1.5"
                        >
                          {isOpening ? (
                            <>
                              <IconLoader2 className="size-3.5 animate-spin" />
                              {copy.openingDocument}
                            </>
                          ) : (
                            <>
                              <IconExternalLink className="size-3.5" />
                              {copy.openDocument}
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
                value={application.status}
                onValueChange={(v) =>
                  onStatusChange(v as ContractorStatusValue)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contractorStatusValues.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel(s, copy)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="contractor-notes"
                className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {copy.fieldNotes}
              </Label>
              <Textarea
                id="contractor-notes"
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
