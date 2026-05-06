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
  IconBrandLinkedin,
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
  applicationStatusValues,
  type ApplicationStatusValue,
} from "@/lib/validation/jobApplication";
import {
  setApplicationStatus,
  setApplicationNotes,
  deleteApplication,
  getApplicationCvUrl,
} from "@/app/[locale]/admin/job-applications/actions";
import { cn } from "@/lib/utils";

export type JobApplicationRow = {
  id: string;
  career_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  cv_file_path: string;
  portfolio_url: string | null;
  linkedin_url: string | null;
  status: ApplicationStatusValue;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CareerOption = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
};

export type JobApplicationsAdminCopy = {
  search: string;
  filterStatus: string;
  filterRole: string;
  filterAll: string;
  exportCsv: string;
  statusNew: string;
  statusReviewing: string;
  statusShortlisted: string;
  statusRejected: string;
  statusHired: string;
  colCandidate: string;
  colRole: string;
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
  fieldRole: string;
  fieldPortfolio: string;
  fieldLinkedin: string;
  fieldCoverLetter: string;
  fieldStatus: string;
  fieldNotes: string;
  fieldNotesPlaceholder: string;
  openCv: string;
  openingCv: string;
  saveNotes: string;
  savingNotes: string;
  notesUnchanged: string;
  successStatusUpdated: string;
  successNotesUpdated: string;
  successDeleted: string;
  errorCvNotFound: string;
  errorUnauthorized: string;
  errorGeneric: string;
  notProvided: string;
  unknownRole: string;
  csvHeaderId: string;
  csvHeaderName: string;
  csvHeaderEmail: string;
  csvHeaderPhone: string;
  csvHeaderRole: string;
  csvHeaderStatus: string;
  csvHeaderSubmitted: string;
  csvHeaderPortfolio: string;
  csvHeaderLinkedin: string;
};

const STATUS_BADGE_CLASSES: Record<ApplicationStatusValue, string> = {
  new: "bg-brand-gold/15 text-brand-gold",
  reviewing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  shortlisted: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
  hired: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
};

function statusLabel(s: ApplicationStatusValue, copy: JobApplicationsAdminCopy) {
  switch (s) {
    case "new":
      return copy.statusNew;
    case "reviewing":
      return copy.statusReviewing;
    case "shortlisted":
      return copy.statusShortlisted;
    case "rejected":
      return copy.statusRejected;
    case "hired":
      return copy.statusHired;
  }
}

function csvEscape(v: string | number | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function JobApplicationsAdminClient({
  applications,
  careers,
  locale,
  copy,
}: {
  applications: JobApplicationRow[];
  careers: CareerOption[];
  locale: "ar" | "en";
  copy: JobApplicationsAdminCopy;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | ApplicationStatusValue
  >("all");
  const [careerFilter, setCareerFilter] = useState<string>("all");
  const [active, setActive] = useState<JobApplicationRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<JobApplicationRow | null>(
    null,
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const careerById = useMemo(() => {
    const m = new Map<string, CareerOption>();
    for (const c of careers) m.set(c.id, c);
    return m;
  }, [careers]);

  const dfLocale = locale === "ar" ? arLocale : enLocale;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (careerFilter !== "all") {
        if (careerFilter === "none" && a.career_id !== null) return false;
        if (careerFilter !== "none" && a.career_id !== careerFilter)
          return false;
      }
      if (!q) return true;
      const role = a.career_id ? careerById.get(a.career_id) : null;
      const hay = [
        a.full_name,
        a.email,
        a.phone ?? "",
        role ? `${role.title_en} ${role.title_ar} ${role.slug}` : "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [applications, careerById, careerFilter, query, statusFilter]);

  function roleTitle(career_id: string | null) {
    if (!career_id) return copy.unknownRole;
    const c = careerById.get(career_id);
    if (!c) return copy.unknownRole;
    return locale === "ar" ? c.title_ar : c.title_en;
  }

  function handleStatusChange(
    a: JobApplicationRow,
    next: ApplicationStatusValue,
  ) {
    if (a.status === next) return;
    setPendingId(a.id);
    startTransition(async () => {
      const res = await setApplicationStatus({ id: a.id, status: next }, locale);
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
      const res = await deleteApplication({ id: target.id }, locale);
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
      copy.csvHeaderRole,
      copy.csvHeaderStatus,
      copy.csvHeaderSubmitted,
      copy.csvHeaderPortfolio,
      copy.csvHeaderLinkedin,
    ];
    const lines = [headers.join(",")];
    for (const a of filtered) {
      lines.push(
        [
          csvEscape(a.id),
          csvEscape(a.full_name),
          csvEscape(a.email),
          csvEscape(a.phone),
          csvEscape(roleTitle(a.career_id)),
          csvEscape(statusLabel(a.status, copy)),
          csvEscape(a.created_at),
          csvEscape(a.portfolio_url),
          csvEscape(a.linkedin_url),
        ].join(","),
      );
    }
    // BOM so Excel reads UTF-8 correctly with the Arabic strings.
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const ts = formatDate(new Date(), "yyyy-MM-dd-HHmm");
    link.href = url;
    link.download = `job-applications-${ts}.csv`;
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
            setStatusFilter(v as "all" | ApplicationStatusValue)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={copy.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copy.filterAll}</SelectItem>
            {applicationStatusValues.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s, copy)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={careerFilter} onValueChange={setCareerFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder={copy.filterRole} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copy.filterAll}</SelectItem>
            <SelectItem value="none">{copy.unknownRole}</SelectItem>
            {careers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {locale === "ar" ? c.title_ar : c.title_en}
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
              <TableHead>{copy.colCandidate}</TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.colRole}
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
                          {a.full_name}
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
                      {roleTitle(a.career_id)}
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
                          handleStatusChange(a, v as ApplicationStatusValue)
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
                          {applicationStatusValues.map((s) => (
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
        roleTitle={active ? roleTitle(active.career_id) : ""}
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
  roleTitle,
  onClose,
  onStatusChange,
  locale,
  copy,
}: {
  application: JobApplicationRow | null;
  roleTitle: string;
  onClose: () => void;
  onStatusChange: (next: ApplicationStatusValue) => void;
  locale: "ar" | "en";
  copy: JobApplicationsAdminCopy;
}) {
  const [notes, setNotes] = useState(application?.notes ?? "");
  const [isOpeningCv, startCv] = useTransition();
  const [isSavingNotes, startSaveNotes] = useTransition();

  const initialNotes = application?.notes ?? "";
  const notesChanged = notes !== initialNotes;

  function openCv() {
    if (!application) return;
    startCv(async () => {
      const res = await getApplicationCvUrl({ id: application.id });
      if (res.ok) {
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      } else if (res.code === "not_found") {
        toast.error(copy.errorCvNotFound);
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
      const res = await setApplicationNotes(
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
              <p className="text-lg font-semibold">{application.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(parseISO(application.created_at), "PPpp", {
                  locale: locale === "ar" ? arLocale : enLocale,
                })}
              </p>
            </div>

            <div className="grid gap-3 text-sm">
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
                {application.phone ? (
                  <a
                    href={`tel:${application.phone}`}
                    className="text-brand-navy hover:text-brand-gold dark:text-brand-cream"
                    dir="ltr"
                  >
                    {application.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
              <Field label={copy.fieldRole}>{roleTitle}</Field>
              <Field label={copy.fieldPortfolio}>
                {application.portfolio_url ? (
                  <a
                    href={application.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-navy hover:text-brand-gold dark:text-brand-cream"
                    dir="ltr"
                  >
                    <IconWorld className="size-3.5" />
                    {application.portfolio_url}
                    <IconExternalLink className="size-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">
                    {copy.notProvided}
                  </span>
                )}
              </Field>
              <Field label={copy.fieldLinkedin}>
                {application.linkedin_url ? (
                  <a
                    href={application.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-navy hover:text-brand-gold dark:text-brand-cream"
                    dir="ltr"
                  >
                    <IconBrandLinkedin className="size-3.5" />
                    {application.linkedin_url}
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
              <Button
                type="button"
                variant="default"
                onClick={openCv}
                disabled={isOpeningCv}
                className="gap-2"
              >
                {isOpeningCv ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" />
                    {copy.openingCv}
                  </>
                ) : (
                  <>
                    <IconFileText className="size-4" />
                    {copy.openCv}
                  </>
                )}
              </Button>
            </div>

            {application.cover_letter ? (
              <div>
                <Label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {copy.fieldCoverLetter}
                </Label>
                <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                  {application.cover_letter}
                </p>
              </div>
            ) : null}

            <div>
              <Label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {copy.fieldStatus}
              </Label>
              <Select
                value={application.status}
                onValueChange={(v) =>
                  onStatusChange(v as ApplicationStatusValue)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {applicationStatusValues.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel(s, copy)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="app-notes"
                className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {copy.fieldNotes}
              </Label>
              <Textarea
                id="app-notes"
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
