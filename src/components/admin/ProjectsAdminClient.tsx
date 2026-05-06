"use client";

import { useMemo, useState, useTransition } from "react";
import {
  useForm,
  useFieldArray,
  type Resolver,
  type SubmitHandler,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  IconPlus,
  IconSearch,
  IconStar,
  IconStarFilled,
  IconPencil,
  IconTrash,
  IconWorld,
  IconArchive,
  IconArrowUp,
  IconArrowDown,
  IconLoader2,
  IconX,
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
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import {
  projectUpsertSchema,
  publishStatusValues,
  type PublishStatusValue,
} from "@/lib/validation/project";
import {
  upsertProject,
  setProjectStatus,
  deleteProject,
} from "@/app/[locale]/admin/projects/actions";
import { cn } from "@/lib/utils";
import { Image, ImageKitProvider } from "@imagekit/next";

export type ProjectMediaItem = {
  id: string;
  project_id: string;
  file_path: string;
  thumbnail_path: string | null;
  caption_en: string | null;
  caption_ar: string | null;
  sort_order: number;
};

export type ProjectListRow = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  summary_en: string | null;
  summary_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  sector: string | null;
  client: string | null;
  location_en: string | null;
  location_ar: string | null;
  year: number | null;
  cover_image_path: string | null;
  status: PublishStatusValue;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectWithGallery = ProjectListRow & {
  gallery: ProjectMediaItem[];
};

export type ProjectsAdminCopy = {
  newProject: string;
  search: string;
  filterStatus: string;
  statusAll: string;
  statusDraft: string;
  statusPublished: string;
  statusArchived: string;
  colCover: string;
  colTitle: string;
  colSector: string;
  colYear: string;
  colStatus: string;
  colMedia: string;
  colFeatured: string;
  colActions: string;
  empty: string;
  edit: string;
  publish: string;
  unpublish: string;
  archive: string;
  delete: string;
  confirmDeleteTitle: string;
  confirmDeleteBody: string;
  confirmDeleteCta: string;
  cancel: string;
  drawerCreateTitle: string;
  drawerEditTitle: string;
  drawerSubtitle: string;
  formSlug: string;
  formSlugHint: string;
  formTitleEn: string;
  formTitleAr: string;
  formSummaryEn: string;
  formSummaryAr: string;
  formDescriptionEn: string;
  formDescriptionAr: string;
  formSector: string;
  formClient: string;
  formLocationEn: string;
  formLocationAr: string;
  formYear: string;
  formStatus: string;
  formIsFeatured: string;
  formSortOrder: string;
  formCoverImage: string;
  formCoverImageHint: string;
  formCoverImageAdd: string;
  formCoverImageReplace: string;
  formCoverImageRemove: string;
  formGallery: string;
  formGalleryHint: string;
  formGalleryAdd: string;
  formGalleryRemove: string;
  formCaptionEn: string;
  formCaptionAr: string;
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
  featuredYes: string;
  featuredNo: string;
};

type FormValues = {
  id?: string | null;
  slug: string;
  title_en: string;
  title_ar: string;
  summary_en: string;
  summary_ar: string;
  description_en: string;
  description_ar: string;
  sector: string;
  client: string;
  location_en: string;
  location_ar: string;
  year: string;
  cover_image_path: string;
  status: PublishStatusValue;
  is_featured: boolean;
  sort_order: number;
  gallery: {
    file_path: string;
    thumbnail_path: string | null;
    caption_en: string;
    caption_ar: string;
  }[];
};

const STATUS_BADGE_CLASSES: Record<PublishStatusValue, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  archived: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

function emptyForm(): FormValues {
  return {
    id: null,
    slug: "",
    title_en: "",
    title_ar: "",
    summary_en: "",
    summary_ar: "",
    description_en: "",
    description_ar: "",
    sector: "",
    client: "",
    location_en: "",
    location_ar: "",
    year: "",
    cover_image_path: "",
    status: "draft",
    is_featured: false,
    sort_order: 0,
    gallery: [],
  };
}

function projectToForm(p: ProjectWithGallery): FormValues {
  return {
    id: p.id,
    slug: p.slug,
    title_en: p.title_en,
    title_ar: p.title_ar,
    summary_en: p.summary_en ?? "",
    summary_ar: p.summary_ar ?? "",
    description_en: p.description_en ?? "",
    description_ar: p.description_ar ?? "",
    sector: p.sector ?? "",
    client: p.client ?? "",
    location_en: p.location_en ?? "",
    location_ar: p.location_ar ?? "",
    year: p.year != null ? String(p.year) : "",
    cover_image_path: p.cover_image_path ?? "",
    status: p.status,
    is_featured: p.is_featured,
    sort_order: p.sort_order,
    gallery: p.gallery.map((g) => ({
      file_path: g.file_path,
      thumbnail_path: g.thumbnail_path ?? null,
      caption_en: g.caption_en ?? "",
      caption_ar: g.caption_ar ?? "",
    })),
  };
}

export function ProjectsAdminClient({
  projects,
  locale,
  copy,
}: {
  projects: ProjectWithGallery[];
  locale: "ar" | "en";
  copy: ProjectsAdminCopy;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PublishStatusValue>(
    "all",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectWithGallery | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProjectWithGallery | null>(
    null,
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        p.slug,
        p.title_en,
        p.title_ar,
        p.client ?? "",
        p.sector ?? "",
        p.location_en ?? "",
        p.location_ar ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [projects, query, statusFilter]);

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(p: ProjectWithGallery) {
    setEditing(p);
    setDrawerOpen(true);
  }

  function handleStatusToggle(p: ProjectWithGallery, next: PublishStatusValue) {
    setPendingId(p.id);
    startTransition(async () => {
      const res = await setProjectStatus({ id: p.id, status: next }, locale);
      setPendingId(null);
      if (res.ok) {
        toast.success(copy.successStatusUpdated);
      } else if (res.code === "unauthorized") {
        toast.error(copy.errorUnauthorized);
      } else {
        toast.error(copy.errorGeneric);
      }
    });
  }

  function handleDeleteConfirmed() {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setPendingId(target.id);
    setConfirmDelete(null);
    startTransition(async () => {
      const res = await deleteProject({ id: target.id }, locale);
      setPendingId(null);
      if (res.ok) {
        toast.success(copy.successDeleted);
      } else if (res.code === "unauthorized") {
        toast.error(copy.errorUnauthorized);
      } else {
        toast.error(copy.errorGeneric);
      }
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
            setStatusFilter(v as "all" | PublishStatusValue)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={copy.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copy.statusAll}</SelectItem>
            <SelectItem value="draft">{copy.statusDraft}</SelectItem>
            <SelectItem value="published">{copy.statusPublished}</SelectItem>
            <SelectItem value="archived">{copy.statusArchived}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openCreate} className="gap-2">
          <IconPlus className="size-4" />
          {copy.newProject}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">{copy.colCover}</TableHead>
              <TableHead>{copy.colTitle}</TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.colSector}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {copy.colYear}
              </TableHead>
              <TableHead>{copy.colStatus}</TableHead>
              <TableHead className="hidden lg:table-cell">
                {copy.colMedia}
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                {copy.colFeatured}
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
              filtered.map((p) => {
                const title = locale === "ar" ? p.title_ar : p.title_en;
                const isPending = pendingId === p.id;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.cover_image_path ? (
                        <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                          <ImageKitProvider
                            urlEndpoint={
                              process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                            }
                          >
                            <Image
                              src={p.cover_image_path}
                              width={500}
                              height={500}
                              alt="cover image"
                            />
                          </ImageKitProvider>
                        </div>
                      ) : (
                        <div className="size-12 rounded-md bg-muted" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{title}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">
                        /{p.slug}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {p.sector ?? "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {p.year ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                          STATUS_BADGE_CLASSES[p.status],
                        )}
                      >
                        {p.status === "draft"
                          ? copy.statusDraft
                          : p.status === "published"
                            ? copy.statusPublished
                            : copy.statusArchived}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {p.gallery.length}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {p.is_featured ? (
                        <IconStarFilled className="size-4 text-brand-gold" />
                      ) : (
                        <IconStar className="size-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="inline-flex items-center gap-1">
                        {p.status !== "published" ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={isPending}
                            title={copy.publish}
                            onClick={() => handleStatusToggle(p, "published")}
                          >
                            {isPending ? (
                              <IconLoader2 className="size-4 animate-spin" />
                            ) : (
                              <IconWorld className="size-4" />
                            )}
                            <span className="sr-only">{copy.publish}</span>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={isPending}
                            title={copy.unpublish}
                            onClick={() => handleStatusToggle(p, "draft")}
                          >
                            {isPending ? (
                              <IconLoader2 className="size-4 animate-spin" />
                            ) : (
                              <IconArchive className="size-4" />
                            )}
                            <span className="sr-only">{copy.unpublish}</span>
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title={copy.edit}
                          onClick={() => openEdit(p)}
                        >
                          <IconPencil className="size-4" />
                          <span className="sr-only">{copy.edit}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title={copy.delete}
                          onClick={() => setConfirmDelete(p)}
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

      <ProjectFormDrawer
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

function ProjectFormDrawer({
  open,
  onOpenChange,
  editing,
  locale,
  copy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ProjectWithGallery | null;
  locale: "ar" | "en";
  copy: ProjectsAdminCopy;
}) {
  const [isPending, startTransition] = useTransition();

  const defaults = useMemo<FormValues>(
    () => (editing ? projectToForm(editing) : emptyForm()),
    [editing],
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
    )(projectUpsertSchema),
    defaultValues: defaults,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "gallery",
  });

  const coverPath = watch("cover_image_path");

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    startTransition(async () => {
      const res = await upsertProject(
        {
          ...values,
          id: values.id || undefined,
          year: values.year === "" ? null : values.year,
          cover_image_path:
            values.cover_image_path === "" ? null : values.cover_image_path,
        },
        locale,
      );
      if (res.ok) {
        toast.success(editing ? copy.successUpdated : copy.successCreated);
        onOpenChange(false);
      } else if (res.code === "validation") {
        toast.error(copy.errorValidation);
      } else if (res.code === "conflict") {
        toast.error(copy.errorSlugConflict);
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
        className="w-full sm:max-w-3xl overflow-y-auto"
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
            <Label htmlFor="proj-slug">{copy.formSlug}</Label>
            <Input
              id="proj-slug"
              dir="ltr"
              {...register("slug")}
              placeholder="riyadh-tower"
              className="mt-1"
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
              <Label htmlFor="proj-title-en">{copy.formTitleEn}</Label>
              <Input
                id="proj-title-en"
                dir="ltr"
                {...register("title_en")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proj-title-ar">{copy.formTitleAr}</Label>
              <Input
                id="proj-title-ar"
                dir="rtl"
                {...register("title_ar")}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="proj-summary-en">{copy.formSummaryEn}</Label>
              <Textarea
                id="proj-summary-en"
                dir="ltr"
                rows={3}
                {...register("summary_en")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proj-summary-ar">{copy.formSummaryAr}</Label>
              <Textarea
                id="proj-summary-ar"
                dir="rtl"
                rows={3}
                {...register("summary_ar")}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="proj-desc-en">{copy.formDescriptionEn}</Label>
              <Textarea
                id="proj-desc-en"
                dir="ltr"
                rows={6}
                {...register("description_en")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proj-desc-ar">{copy.formDescriptionAr}</Label>
              <Textarea
                id="proj-desc-ar"
                dir="rtl"
                rows={6}
                {...register("description_ar")}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="proj-sector">{copy.formSector}</Label>
              <Input
                id="proj-sector"
                {...register("sector")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proj-client">{copy.formClient}</Label>
              <Input
                id="proj-client"
                {...register("client")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proj-loc-en">{copy.formLocationEn}</Label>
              <Input
                id="proj-loc-en"
                dir="ltr"
                {...register("location_en")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proj-loc-ar">{copy.formLocationAr}</Label>
              <Input
                id="proj-loc-ar"
                dir="rtl"
                {...register("location_ar")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proj-year">{copy.formYear}</Label>
              <Input
                id="proj-year"
                type="number"
                inputMode="numeric"
                {...register("year")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proj-sort">{copy.formSortOrder}</Label>
              <Input
                id="proj-sort"
                type="number"
                inputMode="numeric"
                {...register("sort_order", { valueAsNumber: true })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1">{copy.formStatus}</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {publishStatusValues.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s === "draft"
                            ? copy.statusDraft
                            : s === "published"
                              ? copy.statusPublished
                              : copy.statusArchived}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex items-end">
              <Controller
                control={control}
                name="is_featured"
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="size-4 rounded border-border"
                    />
                    {copy.formIsFeatured}
                  </label>
                )}
              />
            </div>
          </div>

          {/* Cover image */}
          <div className="space-y-2">
            <Label>{copy.formCoverImage}</Label>
            <p className="text-xs text-muted-foreground">
              {copy.formCoverImageHint}
            </p>
            {coverPath ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2">
                <div className="relative size-16 overflow-hidden rounded-md bg-muted">
                  <ImageKitProvider
                    urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                  >
                    <Image
                      src={coverPath}
                      width={500}
                      height={500}
                      alt="cover image"
                    />
                  </ImageKitProvider>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="truncate text-xs text-muted-foreground"
                    dir="ltr"
                  >
                    {coverPath}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue("cover_image_path", "")}
                >
                  {copy.formCoverImageRemove}
                </Button>
              </div>
            ) : null}
            <ImageKitUploader
              folder="/public/projects"
              accept="image/*"
              maxSizeMB={20}
              label={
                coverPath ? copy.formCoverImageReplace : copy.formCoverImageAdd
              }
              onUploaded={(results: UploadResult[]) => {
                const r = results[0];
                if (r) setValue("cover_image_path", r.filePath);
              }}
            />
          </div>

          {/* Gallery */}
          <div className="space-y-3">
            <div>
              <Label>{copy.formGallery}</Label>
              <p className="text-xs text-muted-foreground mt-1">
                {copy.formGalleryHint}
              </p>
            </div>

            {fields.length > 0 ? (
              <ul className="space-y-2">
                {fields.map((g, idx) => (
                  <li
                    key={g.id}
                    className="flex flex-wrap items-start gap-3 rounded-lg border border-border bg-muted/30 p-2"
                  >
                    <div className="relative size-16 overflow-hidden rounded-md bg-muted shrink-0">
                      <ImageKitProvider
                        urlEndpoint={
                          process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                        }
                      >
                        <Image
                          src={g.file_path}
                          width={500}
                          height={500}
                          alt="cover image"
                        />
                      </ImageKitProvider>
                    </div>
                    <div className="grid flex-1 min-w-[200px] gap-2 sm:grid-cols-2">
                      <Input
                        dir="ltr"
                        placeholder={copy.formCaptionEn}
                        {...register(`gallery.${idx}.caption_en` as const)}
                      />
                      <Input
                        dir="rtl"
                        placeholder={copy.formCaptionAr}
                        {...register(`gallery.${idx}.caption_ar` as const)}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={idx === 0}
                        onClick={() => move(idx, idx - 1)}
                        title="Move up"
                      >
                        <IconArrowUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={idx === fields.length - 1}
                        onClick={() => move(idx, idx + 1)}
                        title="Move down"
                      >
                        <IconArrowDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => remove(idx)}
                        title={copy.formGalleryRemove}
                      >
                        <IconX className="size-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            <ImageKitUploader
              folder="/public/projects"
              accept="image/*"
              multiple
              maxSizeMB={20}
              label={copy.formGalleryAdd}
              onUploaded={(results: UploadResult[]) => {
                for (const r of results) {
                  append({
                    file_path: r.filePath,
                    thumbnail_path: null,
                    caption_en: "",
                    caption_ar: "",
                  });
                }
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
