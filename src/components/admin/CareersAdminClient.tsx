"use client";

import { useMemo, useState, useTransition } from "react";
import {
  useForm,
  type Resolver,
  type SubmitHandler,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  IconPlus,
  IconSearch,
  IconPencil,
  IconTrash,
  IconWorld,
  IconArchive,
  IconLoader2,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  careerUpsertSchema,
  careerStatusValues,
  type CareerStatusValue,
} from "@/lib/validation/career";
import {
  upsertCareer,
  setCareerStatus,
  deleteCareer,
} from "@/app/[locale]/admin/careers/actions";
import { cn } from "@/lib/utils";

export type CareerListRow = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  department_en: string | null;
  department_ar: string | null;
  location_en: string | null;
  location_ar: string | null;
  type_en: string | null;
  type_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  requirements_en: string | null;
  requirements_ar: string | null;
  status: CareerStatusValue;
  closes_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CareerWithCount = CareerListRow & { application_count: number };

export type CareersAdminCopy = {
  newCareer: string;
  search: string;
  filterStatus: string;
  statusAll: string;
  statusDraft: string;
  statusOpen: string;
  statusClosed: string;
  colTitle: string;
  colDepartment: string;
  colLocation: string;
  colType: string;
  colStatus: string;
  colCloses: string;
  colApplications: string;
  colActions: string;
  empty: string;
  edit: string;
  open: string;
  close: string;
  unpublish: string;
  delete: string;
  cancel: string;
  confirmDeleteTitle: string;
  confirmDeleteBody: string;
  confirmDeleteCta: string;
  drawerCreateTitle: string;
  drawerEditTitle: string;
  drawerSubtitle: string;
  formSlug: string;
  formSlugHint: string;
  formTitleEn: string;
  formTitleAr: string;
  formDepartmentEn: string;
  formDepartmentAr: string;
  formLocationEn: string;
  formLocationAr: string;
  formTypeEn: string;
  formTypeAr: string;
  formDescriptionEn: string;
  formDescriptionAr: string;
  formRequirementsEn: string;
  formRequirementsAr: string;
  formStatus: string;
  formClosesAt: string;
  formClosesAtHint: string;
  save: string;
  saving: string;
  successCreated: string;
  successUpdated: string;
  successDeleted: string;
  successStatusUpdated: string;
  errorValidation: string;
  errorSlugConflict: string;
  errorUnauthorized: string;
  errorGeneric: string;
  noCloseDate: string;
};

const STATUS_BADGE_CLASSES: Record<CareerStatusValue, string> = {
  draft: "bg-muted text-muted-foreground",
  open: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  closed: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

type FormValues = {
  id?: string | null;
  slug: string;
  title_en: string;
  title_ar: string;
  department_en: string;
  department_ar: string;
  location_en: string;
  location_ar: string;
  type_en: string;
  type_ar: string;
  description_en: string;
  description_ar: string;
  requirements_en: string;
  requirements_ar: string;
  status: CareerStatusValue;
  closes_at: string;
};

function emptyForm(): FormValues {
  return {
    id: null,
    slug: "",
    title_en: "",
    title_ar: "",
    department_en: "",
    department_ar: "",
    location_en: "",
    location_ar: "",
    type_en: "",
    type_ar: "",
    description_en: "",
    description_ar: "",
    requirements_en: "",
    requirements_ar: "",
    status: "draft",
    closes_at: "",
  };
}

function isoToInputDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function careerToForm(c: CareerListRow): FormValues {
  return {
    id: c.id,
    slug: c.slug,
    title_en: c.title_en,
    title_ar: c.title_ar,
    department_en: c.department_en ?? "",
    department_ar: c.department_ar ?? "",
    location_en: c.location_en ?? "",
    location_ar: c.location_ar ?? "",
    type_en: c.type_en ?? "",
    type_ar: c.type_ar ?? "",
    description_en: c.description_en ?? "",
    description_ar: c.description_ar ?? "",
    requirements_en: c.requirements_en ?? "",
    requirements_ar: c.requirements_ar ?? "",
    status: c.status,
    closes_at: isoToInputDate(c.closes_at),
  };
}

function formatCloses(
  iso: string | null,
  locale: "ar" | "en",
  fallback: string,
): string {
  if (!iso) return fallback;
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return fallback;
  }
}

export function CareersAdminClient({
  careers,
  locale,
  copy,
}: {
  careers: CareerWithCount[];
  locale: "ar" | "en";
  copy: CareersAdminCopy;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CareerStatusValue>(
    "all",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CareerWithCount | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CareerWithCount | null>(
    null,
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return careers.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        c.slug,
        c.title_en,
        c.title_ar,
        c.department_en ?? "",
        c.department_ar ?? "",
        c.location_en ?? "",
        c.location_ar ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [careers, query, statusFilter]);

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(c: CareerWithCount) {
    setEditing(c);
    setDrawerOpen(true);
  }

  function handleStatusToggle(c: CareerWithCount, next: CareerStatusValue) {
    setPendingId(c.id);
    startTransition(async () => {
      const res = await setCareerStatus({ id: c.id, status: next }, locale);
      setPendingId(null);
      if (res.ok) toast.success(copy.successStatusUpdated);
      else if (res.code === "unauthorized") toast.error(copy.errorUnauthorized);
      else toast.error(copy.errorGeneric);
    });
  }

  function handleDeleteConfirmed() {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setPendingId(target.id);
    setConfirmDelete(null);
    startTransition(async () => {
      const res = await deleteCareer({ id: target.id }, locale);
      setPendingId(null);
      if (res.ok) toast.success(copy.successDeleted);
      else if (res.code === "unauthorized") toast.error(copy.errorUnauthorized);
      else toast.error(copy.errorGeneric);
    });
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
            setStatusFilter(v as "all" | CareerStatusValue)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={copy.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copy.statusAll}</SelectItem>
            <SelectItem value="draft">{copy.statusDraft}</SelectItem>
            <SelectItem value="open">{copy.statusOpen}</SelectItem>
            <SelectItem value="closed">{copy.statusClosed}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openCreate} className="gap-2">
          <IconPlus className="size-4" />
          {copy.newCareer}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{copy.colTitle}</TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.colDepartment}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.colLocation}
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                {copy.colType}
              </TableHead>
              <TableHead>{copy.colStatus}</TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.colCloses}
              </TableHead>
              <TableHead className="hidden lg:table-cell text-end">
                {copy.colApplications}
              </TableHead>
              <TableHead className="text-end">{copy.colActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {copy.empty}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => {
                const title = locale === "ar" ? c.title_ar : c.title_en;
                const dept =
                  locale === "ar" ? c.department_ar : c.department_en;
                const loc = locale === "ar" ? c.location_ar : c.location_en;
                const type = locale === "ar" ? c.type_ar : c.type_en;
                const isPending = pendingId === c.id;
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{title}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">
                        /{c.slug}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {dept ?? "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {loc ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {type ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                          STATUS_BADGE_CLASSES[c.status],
                        )}
                      >
                        {c.status === "draft"
                          ? copy.statusDraft
                          : c.status === "open"
                            ? copy.statusOpen
                            : copy.statusClosed}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {formatCloses(c.closes_at, locale, copy.noCloseDate)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-end">
                      {c.application_count}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="inline-flex items-center gap-1">
                        {c.status !== "open" ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={isPending}
                            title={copy.open}
                            onClick={() => handleStatusToggle(c, "open")}
                          >
                            {isPending ? (
                              <IconLoader2 className="size-4 animate-spin" />
                            ) : (
                              <IconWorld className="size-4" />
                            )}
                            <span className="sr-only">{copy.open}</span>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={isPending}
                            title={copy.close}
                            onClick={() => handleStatusToggle(c, "closed")}
                          >
                            {isPending ? (
                              <IconLoader2 className="size-4 animate-spin" />
                            ) : (
                              <IconArchive className="size-4" />
                            )}
                            <span className="sr-only">{copy.close}</span>
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title={copy.edit}
                          onClick={() => openEdit(c)}
                        >
                          <IconPencil className="size-4" />
                          <span className="sr-only">{copy.edit}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title={copy.delete}
                          onClick={() => setConfirmDelete(c)}
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

      <CareerFormDrawer
        key={editing?.id ?? "new"}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        editing={editing}
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

function CareerFormDrawer({
  open,
  onOpenChange,
  editing,
  locale,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: CareerListRow | null;
  locale: "ar" | "en";
  copy: CareersAdminCopy;
}) {
  const [isPending, startTransition] = useTransition();

  const defaults = useMemo<FormValues>(
    () => (editing ? careerToForm(editing) : emptyForm()),
    [editing],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: (zodResolver as unknown as (schema: unknown) => Resolver<FormValues>)(
      careerUpsertSchema,
    ),
    defaultValues: defaults,
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    startTransition(async () => {
      const res = await upsertCareer(
        {
          ...values,
          id: values.id || undefined,
          closes_at: values.closes_at === "" ? null : values.closes_at,
        },
        locale,
      );
      if (res.ok) {
        toast.success(editing ? copy.successUpdated : copy.successCreated);
        onOpenChange(false);
      } else if (res.code === "validation") toast.error(copy.errorValidation);
      else if (res.code === "conflict") toast.error(copy.errorSlugConflict);
      else if (res.code === "unauthorized")
        toast.error(copy.errorUnauthorized);
      else toast.error(copy.errorGeneric);
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={locale === "ar" ? "left" : "right"}
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>
            {editing ? copy.drawerEditTitle : copy.drawerCreateTitle}
          </SheetTitle>
          <SheetDescription>{copy.drawerSubtitle}</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 px-4 pb-6"
          noValidate
        >
          <div>
            <Label htmlFor="career-slug">{copy.formSlug}</Label>
            <Input
              id="career-slug"
              dir="ltr"
              {...register("slug")}
              placeholder="senior-civil-engineer"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {copy.formSlugHint}
            </p>
            {errors.slug ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.slug.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="career-title-en">{copy.formTitleEn}</Label>
              <Input
                id="career-title-en"
                dir="ltr"
                {...register("title_en")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="career-title-ar">{copy.formTitleAr}</Label>
              <Input
                id="career-title-ar"
                dir="rtl"
                {...register("title_ar")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="career-dept-en">{copy.formDepartmentEn}</Label>
              <Input
                id="career-dept-en"
                dir="ltr"
                {...register("department_en")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="career-dept-ar">{copy.formDepartmentAr}</Label>
              <Input
                id="career-dept-ar"
                dir="rtl"
                {...register("department_ar")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="career-loc-en">{copy.formLocationEn}</Label>
              <Input
                id="career-loc-en"
                dir="ltr"
                {...register("location_en")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="career-loc-ar">{copy.formLocationAr}</Label>
              <Input
                id="career-loc-ar"
                dir="rtl"
                {...register("location_ar")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="career-type-en">{copy.formTypeEn}</Label>
              <Input
                id="career-type-en"
                dir="ltr"
                placeholder="Full-time"
                {...register("type_en")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="career-type-ar">{copy.formTypeAr}</Label>
              <Input
                id="career-type-ar"
                dir="rtl"
                placeholder="دوام كامل"
                {...register("type_ar")}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="career-desc-en">{copy.formDescriptionEn}</Label>
              <Textarea
                id="career-desc-en"
                dir="ltr"
                rows={6}
                {...register("description_en")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="career-desc-ar">{copy.formDescriptionAr}</Label>
              <Textarea
                id="career-desc-ar"
                dir="rtl"
                rows={6}
                {...register("description_ar")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="career-req-en">{copy.formRequirementsEn}</Label>
              <Textarea
                id="career-req-en"
                dir="ltr"
                rows={6}
                {...register("requirements_en")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="career-req-ar">{copy.formRequirementsAr}</Label>
              <Textarea
                id="career-req-ar"
                dir="rtl"
                rows={6}
                {...register("requirements_ar")}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2">{copy.formStatus}</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {careerStatusValues.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s === "draft"
                            ? copy.statusDraft
                            : s === "open"
                              ? copy.statusOpen
                              : copy.statusClosed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="career-closes">{copy.formClosesAt}</Label>
              <Input
                id="career-closes"
                type="date"
                dir="ltr"
                {...register("closes_at")}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {copy.formClosesAtHint}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {copy.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  {copy.saving}
                </>
              ) : (
                copy.save
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
