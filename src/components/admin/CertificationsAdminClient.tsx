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
  IconLoader2,
  IconArrowsSort,
  IconArrowUp,
  IconArrowDown,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLock,
  IconExternalLink,
  IconFileText,
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
  ImageKitUploader,
  type UploadResult,
} from "@/components/imagekit/ImageKitUploader";
import { certificationUpsertSchema } from "@/lib/validation/certification";
import {
  mediaVisibilityValues,
  type MediaVisibilityValue,
} from "@/lib/validation/studio";
import {
  upsertCertification,
  setCertificationVisibility,
  reorderCertifications,
  deleteCertification,
  getCertificationFileUrl,
} from "@/app/[locale]/admin/certifications/actions";
import { cn } from "@/lib/utils";
import { Image, ImageKitProvider } from "@imagekit/next";

export type CertificationRow = {
  id: string;
  title_en: string;
  title_ar: string;
  issuer_en: string | null;
  issuer_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  file_path: string;
  thumbnail_path: string | null;
  visibility: MediaVisibilityValue;
  issued_on: string | null;
  expires_on: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CertificationsAdminCopy = {
  newCert: string;
  search: string;
  filterVisibility: string;
  filterAll: string;
  visibilityPublic: string;
  visibilityPrivate: string;
  colTitle: string;
  colIssuer: string;
  colIssued: string;
  colExpires: string;
  colVisibility: string;
  colActions: string;
  empty: string;
  edit: string;
  openFile: string;
  openingFile: string;
  delete: string;
  cancel: string;
  reorder: string;
  reorderHint: string;
  reorderSave: string;
  reorderSaving: string;
  reorderCancel: string;
  confirmDeleteTitle: string;
  confirmDeleteBody: string;
  confirmDeleteCta: string;
  drawerCreateTitle: string;
  drawerEditTitle: string;
  drawerSubtitle: string;
  formTitleEn: string;
  formTitleAr: string;
  formIssuerEn: string;
  formIssuerAr: string;
  formDescriptionEn: string;
  formDescriptionAr: string;
  formIssuedOn: string;
  formExpiresOn: string;
  formVisibility: string;
  formSortOrder: string;
  formFile: string;
  formFileHint: string;
  formFileAdd: string;
  formFileReplace: string;
  formThumbnail: string;
  formThumbnailHint: string;
  formThumbnailAdd: string;
  formThumbnailReplace: string;
  formThumbnailRemove: string;
  save: string;
  saving: string;
  successCreated: string;
  successUpdated: string;
  successDeleted: string;
  successVisibilityUpdated: string;
  successReordered: string;
  errorValidation: string;
  errorFileRequired: string;
  errorUnauthorized: string;
  errorFileNotFound: string;
  errorGeneric: string;
};

type FormValues = {
  id?: string | null;
  title_en: string;
  title_ar: string;
  issuer_en: string;
  issuer_ar: string;
  description_en: string;
  description_ar: string;
  file_path: string;
  thumbnail_path: string;
  visibility: MediaVisibilityValue;
  issued_on: string;
  expires_on: string;
  sort_order: number;
};

function emptyForm(): FormValues {
  return {
    id: null,
    title_en: "",
    title_ar: "",
    issuer_en: "",
    issuer_ar: "",
    description_en: "",
    description_ar: "",
    file_path: "",
    thumbnail_path: "",
    visibility: "public",
    issued_on: "",
    expires_on: "",
    sort_order: 0,
  };
}

function certToForm(c: CertificationRow): FormValues {
  return {
    id: c.id,
    title_en: c.title_en,
    title_ar: c.title_ar,
    issuer_en: c.issuer_en ?? "",
    issuer_ar: c.issuer_ar ?? "",
    description_en: c.description_en ?? "",
    description_ar: c.description_ar ?? "",
    file_path: c.file_path,
    thumbnail_path: c.thumbnail_path ?? "",
    visibility: c.visibility,
    issued_on: c.issued_on ?? "",
    expires_on: c.expires_on ?? "",
    sort_order: c.sort_order,
  };
}

function fmtDate(iso: string | null, locale: "ar" | "en", fallback = "—") {
  if (!iso) return fallback;
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function CertificationsAdminClient({
  items,
  locale,
  copy,
}: {
  items: CertificationRow[];
  locale: "ar" | "en";
  copy: CertificationsAdminCopy;
}) {
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<
    "all" | MediaVisibilityValue
  >("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CertificationRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CertificationRow | null>(
    null,
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Reorder mode
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderedIds, setReorderedIds] = useState<string[]>([]);
  const [isReorderSaving, startReorderSave] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((c) => {
      if (visibilityFilter !== "all" && c.visibility !== visibilityFilter)
        return false;
      if (!q) return true;
      const hay = [c.title_en, c.title_ar, c.issuer_en ?? "", c.issuer_ar ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, visibilityFilter]);

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(c: CertificationRow) {
    setEditing(c);
    setDrawerOpen(true);
  }

  function handleVisibilityToggle(c: CertificationRow) {
    const next: MediaVisibilityValue =
      c.visibility === "public" ? "private" : "public";
    setPendingId(c.id);
    startTransition(async () => {
      const res = await setCertificationVisibility(
        { id: c.id, visibility: next },
        locale,
      );
      setPendingId(null);
      if (res.ok) toast.success(copy.successVisibilityUpdated);
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
      const res = await deleteCertification({ id: target.id }, locale);
      setPendingId(null);
      if (res.ok) toast.success(copy.successDeleted);
      else if (res.code === "unauthorized") toast.error(copy.errorUnauthorized);
      else toast.error(copy.errorGeneric);
    });
  }

  function enterReorder() {
    setReorderedIds(items.map((c) => c.id));
    setReorderMode(true);
  }

  function moveReorder(idx: number, dir: -1 | 1) {
    const next = [...reorderedIds];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setReorderedIds(next);
  }

  function saveReorder() {
    startReorderSave(async () => {
      const res = await reorderCertifications({ order: reorderedIds }, locale);
      if (res.ok) {
        toast.success(copy.successReordered);
        setReorderMode(false);
      } else if (res.code === "unauthorized") {
        toast.error(copy.errorUnauthorized);
      } else {
        toast.error(copy.errorGeneric);
      }
    });
  }

  function openFile(c: CertificationRow) {
    setPendingId(c.id);
    startTransition(async () => {
      const res = await getCertificationFileUrl({ id: c.id });
      setPendingId(null);
      if (res.ok) {
        window.open(res.data.filePath, "_blank", "noopener,noreferrer");
      } else if (res.code === "not_found") {
        toast.error(copy.errorFileNotFound);
      } else if (res.code === "unauthorized") {
        toast.error(copy.errorUnauthorized);
      } else {
        toast.error(copy.errorGeneric);
      }
    });
  }

  const displayItems = reorderMode
    ? (reorderedIds
        .map((id) => items.find((c) => c.id === id))
        .filter(Boolean) as CertificationRow[])
    : filtered;

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
          value={visibilityFilter}
          onValueChange={(v) =>
            setVisibilityFilter(v as "all" | MediaVisibilityValue)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={copy.filterVisibility} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copy.filterAll}</SelectItem>
            <SelectItem value="public">{copy.visibilityPublic}</SelectItem>
            <SelectItem value="private">{copy.visibilityPrivate}</SelectItem>
          </SelectContent>
        </Select>
        <div className="ms-auto flex items-center gap-2">
          {reorderMode ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {copy.reorderHint}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReorderMode(false)}
                disabled={isReorderSaving}
              >
                {copy.reorderCancel}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={saveReorder}
                disabled={isReorderSaving}
              >
                {isReorderSaving ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" />
                    {copy.reorderSaving}
                  </>
                ) : (
                  <>
                    <IconCheck className="size-4" />
                    {copy.reorderSave}
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={enterReorder}
                disabled={items.length < 2}
                className="gap-2"
              >
                <IconArrowsSort className="size-4" />
                {copy.reorder}
              </Button>
              <Button onClick={openCreate} className="gap-2">
                <IconPlus className="size-4" />
                {copy.newCert}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">#</TableHead>
              <TableHead>{copy.colTitle}</TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.colIssuer}
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                {copy.colIssued}
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                {copy.colExpires}
              </TableHead>
              <TableHead>{copy.colVisibility}</TableHead>
              <TableHead className="text-end">{copy.colActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {copy.empty}
                </TableCell>
              </TableRow>
            ) : (
              displayItems.map((c, idx) => {
                const title = locale === "ar" ? c.title_ar : c.title_en;
                const issuer = locale === "ar" ? c.issuer_ar : c.issuer_en;
                const isPending = pendingId === c.id;
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {idx + 1}
                        </span>
                        {c.thumbnail_path ? (
                          <div className="relative size-8 overflow-hidden rounded bg-muted">
                            <ImageKitProvider
                              urlEndpoint={
                                process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                              }
                            >
                              <Image
                                src={c.thumbnail_path}
                                fill
                                sizes="32px"
                                className="object-cover"
                                alt="cover image"
                              />
                            </ImageKitProvider>
                          </div>
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded bg-muted text-muted-foreground">
                            <IconFileText className="size-4" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{title}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {issuer ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {fmtDate(c.issued_on, locale)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {fmtDate(c.expires_on, locale)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                          c.visibility === "public"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {c.visibility === "private" ? (
                          <IconLock className="size-3" />
                        ) : (
                          <IconEye className="size-3" />
                        )}
                        {c.visibility === "public"
                          ? copy.visibilityPublic
                          : copy.visibilityPrivate}
                      </span>
                    </TableCell>
                    <TableCell className="text-end">
                      {reorderMode ? (
                        <div className="inline-flex items-center gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={idx === 0}
                            onClick={() => moveReorder(idx, -1)}
                          >
                            <IconArrowUp className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={idx === displayItems.length - 1}
                            onClick={() => moveReorder(idx, 1)}
                          >
                            <IconArrowDown className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            title={copy.openFile}
                            disabled={isPending}
                            onClick={() => openFile(c)}
                          >
                            {isPending ? (
                              <IconLoader2 className="size-4 animate-spin" />
                            ) : (
                              <IconExternalLink className="size-4" />
                            )}
                            <span className="sr-only">{copy.openFile}</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={isPending}
                            title={
                              c.visibility === "public"
                                ? copy.visibilityPrivate
                                : copy.visibilityPublic
                            }
                            onClick={() => handleVisibilityToggle(c)}
                          >
                            {c.visibility === "public" ? (
                              <IconEyeOff className="size-4" />
                            ) : (
                              <IconEye className="size-4" />
                            )}
                          </Button>
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
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CertificationFormDrawer
        key={editing?.id ?? "new"}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        editing={editing}
        nextSortOrder={items.length}
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

function CertificationFormDrawer({
  open,
  onOpenChange,
  editing,
  nextSortOrder,
  locale,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: CertificationRow | null;
  nextSortOrder: number;
  locale: "ar" | "en";
  copy: CertificationsAdminCopy;
}) {
  const [isPending, startTransition] = useTransition();

  const defaults = useMemo<FormValues>(
    () =>
      editing
        ? certToForm(editing)
        : { ...emptyForm(), sort_order: nextSortOrder },
    [editing, nextSortOrder],
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: (
      zodResolver as unknown as (schema: unknown) => Resolver<FormValues>
    )(certificationUpsertSchema),
    defaultValues: defaults,
  });

  const filePath = watch("file_path");
  const thumbnailPath = watch("thumbnail_path");

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    if (!values.file_path) {
      toast.error(copy.errorFileRequired);
      return;
    }
    startTransition(async () => {
      const res = await upsertCertification(
        {
          ...values,
          id: values.id || undefined,
          thumbnail_path:
            values.thumbnail_path === "" ? null : values.thumbnail_path,
          issued_on: values.issued_on === "" ? null : values.issued_on,
          expires_on: values.expires_on === "" ? null : values.expires_on,
        },
        locale,
      );
      if (res.ok) {
        toast.success(editing ? copy.successUpdated : copy.successCreated);
        onOpenChange(false);
      } else if (res.code === "validation") {
        toast.error(copy.errorValidation);
      } else if (res.code === "unauthorized") {
        toast.error(copy.errorUnauthorized);
      } else {
        toast.error(copy.errorGeneric);
      }
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cert-title-en">{copy.formTitleEn}</Label>
              <Input id="cert-title-en" dir="ltr" {...register("title_en")} className="mt-2" />
              {errors.title_en ? (
                <p className="mt-1 text-xs text-destructive">
                  {errors.title_en.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="cert-title-ar">{copy.formTitleAr}</Label>
              <Input id="cert-title-ar" dir="rtl" {...register("title_ar")} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="cert-issuer-en">{copy.formIssuerEn}</Label>
              <Input id="cert-issuer-en" dir="ltr" {...register("issuer_en")} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="cert-issuer-ar">{copy.formIssuerAr}</Label>
              <Input id="cert-issuer-ar" dir="rtl" {...register("issuer_ar")} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="cert-desc-en">{copy.formDescriptionEn}</Label>
              <Textarea
                id="cert-desc-en"
                dir="ltr"
                rows={3}
                {...register("description_en")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="cert-desc-ar">{copy.formDescriptionAr}</Label>
              <Textarea
                id="cert-desc-ar"
                dir="rtl"
                rows={3}
                {...register("description_ar")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="cert-issued">{copy.formIssuedOn}</Label>
              <Input
                id="cert-issued"
                type="date"
                dir="ltr"
                {...register("issued_on")}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="cert-expires">{copy.formExpiresOn}</Label>
              <Input
                id="cert-expires"
                type="date"
                dir="ltr"
                {...register("expires_on")}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="mb-2">{copy.formVisibility}</Label>
              <Controller
                control={control}
                name="visibility"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaVisibilityValues.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v === "public"
                            ? copy.visibilityPublic
                            : copy.visibilityPrivate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="cert-sort">{copy.formSortOrder}</Label>
              <Input
                id="cert-sort"
                type="number"
                inputMode="numeric"
                {...register("sort_order", { valueAsNumber: true })}
                className="mt-2"
              />
            </div>
          </div>

          {/* Certificate file (required) */}
          <div className="space-y-2">
            <Label>{copy.formFile}</Label>
            <p className="text-xs text-muted-foreground">{copy.formFileHint}</p>
            {filePath ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2">
                <IconFileText className="size-5 text-muted-foreground" />
                <p
                  className="flex-1 min-w-0 truncate text-xs text-muted-foreground"
                  dir="ltr"
                >
                  {filePath}
                </p>
              </div>
            ) : null}
            <Controller
              control={control}
              name="visibility"
              render={({ field: vis }) => (
                <ImageKitUploader
                  folder={
                    vis.value === "private"
                      ? "/private/certifications"
                      : "/public/projects"
                  }
                  accept=".pdf,image/*"
                  maxSizeMB={20}
                  label={filePath ? copy.formFileReplace : copy.formFileAdd}
                  onUploaded={(results: UploadResult[]) => {
                    const r = results[0];
                    if (r) setValue("file_path", r.filePath);
                  }}
                />
              )}
            />
          </div>

          {/* Thumbnail (optional) */}
          <div className="space-y-2">
            <Label>{copy.formThumbnail}</Label>
            <p className="text-xs text-muted-foreground">
              {copy.formThumbnailHint}
            </p>
            {thumbnailPath ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2">
                <div className="relative size-12 overflow-hidden rounded bg-muted">
                  <ImageKitProvider
                    urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                  >
                    <Image
                      src={thumbnailPath}
                      fill
                      sizes="48px"
                      className="object-cover"
                      alt="cover image"
                    />
                  </ImageKitProvider>
                </div>
                <p
                  className="flex-1 min-w-0 truncate text-xs text-muted-foreground"
                  dir="ltr"
                >
                  {thumbnailPath}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue("thumbnail_path", "")}
                >
                  {copy.formThumbnailRemove}
                </Button>
              </div>
            ) : null}
            <ImageKitUploader
              folder="/public/projects"
              accept="image/*"
              maxSizeMB={5}
              label={
                thumbnailPath
                  ? copy.formThumbnailReplace
                  : copy.formThumbnailAdd
              }
              onUploaded={(results: UploadResult[]) => {
                const r = results[0];
                if (r) setValue("thumbnail_path", r.filePath);
              }}
            />
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
