"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  IconArrowsSort,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLock,
  IconPencil,
  IconTrash,
  IconX,
  IconLoader2,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ImageKitUploader,
  type UploadResult,
} from "@/components/imagekit/ImageKitUploader";
import {
  createStudioItems,
  updateStudioItem,
  deleteStudioItem,
  reorderStudio,
} from "@/app/[locale]/admin/portfolio-studio/actions";
import type {
  MediaKindValue,
  MediaVisibilityValue,
} from "@/lib/validation/studio";
import { cn } from "@/lib/utils";
import { Image, ImageKitProvider } from "@imagekit/next";

export type StudioRow = {
  id: string;
  kind: MediaKindValue;
  file_path: string;
  thumbnail_path: string | null;
  caption_en: string | null;
  caption_ar: string | null;
  tags: string[];
  visibility: MediaVisibilityValue;
  sort_order: number;
  created_at: string;
};

export type StudioAdminCopy = {
  uploadTitle: string;
  uploadSubtitle: string;
  uploadAdd: string;
  uploadVisibility: string;
  uploadVisibilityPublic: string;
  uploadVisibilityPrivate: string;
  uploadTags: string;
  uploadTagsHint: string;
  uploadTagsPlaceholder: string;
  uploadStaged: string;
  uploadConfirm: string;
  uploadConfirming: string;
  uploadDiscard: string;
  filterTags: string;
  filterAll: string;
  filterVisibility: string;
  reorder: string;
  reorderHint: string;
  reorderSave: string;
  reorderSaving: string;
  reorderCancel: string;
  empty: string;
  edit: string;
  delete: string;
  confirmDeleteTitle: string;
  confirmDeleteBody: string;
  confirmDeleteCta: string;
  cancel: string;
  editTitle: string;
  editSubtitle: string;
  formCaptionEn: string;
  formCaptionAr: string;
  formTags: string;
  formTagsHint: string;
  formVisibility: string;
  save: string;
  saving: string;
  successCreated: string;
  successUpdated: string;
  successDeleted: string;
  successReordered: string;
  errorValidation: string;
  errorUnauthorized: string;
  errorGeneric: string;
  visibilityPublic: string;
  visibilityPrivate: string;
};

type Staged = {
  file_path: string;
  thumbnail_path: string | null;
  kind: MediaKindValue;
};

function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export function StudioAdminClient({
  items,
  allTags,
  locale,
  copy,
}: {
  items: StudioRow[];
  allTags: string[];
  locale: "ar" | "en";
  copy: StudioAdminCopy;
}) {
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<
    "all" | MediaVisibilityValue
  >("all");

  // Upload staging
  const [staged, setStaged] = useState<Staged[]>([]);
  const [stagedTagsInput, setStagedTagsInput] = useState("");
  const [stagedVisibility, setStagedVisibility] =
    useState<MediaVisibilityValue>("public");

  // Editing
  const [editing, setEditing] = useState<StudioRow | null>(null);

  // Reorder mode
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderedIds, setReorderedIds] = useState<string[]>([]);

  // Delete
  const [confirmDelete, setConfirmDelete] = useState<StudioRow | null>(null);

  const [isUploading, startUpload] = useTransition();
  const [isReorderSaving, startReorderSave] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (visibilityFilter !== "all" && it.visibility !== visibilityFilter)
        return false;
      if (tagFilter !== "all" && !it.tags.includes(tagFilter)) return false;
      return true;
    });
  }, [items, tagFilter, visibilityFilter]);

  // Once we enter reorder mode, capture the current ordering as the working list.
  function enterReorder() {
    setReorderedIds(items.map((it) => it.id));
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
      const res = await reorderStudio({ order: reorderedIds }, locale);
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

  function confirmStagedUpload() {
    if (staged.length === 0) return;
    startUpload(async () => {
      const res = await createStudioItems(
        {
          items: staged,
          tags: parseTags(stagedTagsInput),
          visibility: stagedVisibility,
        },
        locale,
      );
      if (res.ok) {
        toast.success(copy.successCreated);
        setStaged([]);
        setStagedTagsInput("");
        setStagedVisibility("public");
      } else if (res.code === "validation") {
        toast.error(copy.errorValidation);
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
      const res = await deleteStudioItem({ id: target.id }, locale);
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

  // Render order: in reorder mode, follow reorderedIds; otherwise apply filters.
  const displayItems = reorderMode
    ? (reorderedIds
        .map((id) => items.find((it) => it.id === id))
        .filter(Boolean) as StudioRow[])
    : filtered;

  return (
    <div className="space-y-6">
      {/* Upload panel */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold tracking-tight">
            {copy.uploadTitle}
          </h2>
          <p className="text-xs text-muted-foreground">{copy.uploadSubtitle}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Label className="mb-2 block">{copy.uploadTags}</Label>
            <Input
              value={stagedTagsInput}
              onChange={(e) => setStagedTagsInput(e.target.value)}
              placeholder={copy.uploadTagsPlaceholder}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {copy.uploadTagsHint}
            </p>
          </div>
          <div>
            <Label className="mb-2 block">{copy.uploadVisibility}</Label>
            <Select
              value={stagedVisibility}
              onValueChange={(v) =>
                setStagedVisibility(v as MediaVisibilityValue)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  {copy.uploadVisibilityPublic}
                </SelectItem>
                <SelectItem value="private">
                  {copy.uploadVisibilityPrivate}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ImageKitUploader
            folder={
              stagedVisibility === "public"
                ? "/public/studio"
                : "/private/documents"
            }
            accept="image/*,video/mp4"
            multiple
            maxSizeMB={50}
            label={copy.uploadAdd}
            onUploaded={(results: UploadResult[]) => {
              setStaged((prev) => [
                ...prev,
                ...results.map((r) => ({
                  file_path: r.filePath,
                  thumbnail_path: null,
                  kind: (r.fileType?.startsWith("video")
                    ? "video"
                    : "image") as MediaKindValue,
                })),
              ]);
            }}
          />
          {staged.length > 0 ? (
            <>
              <span className="text-xs text-muted-foreground">
                {copy.uploadStaged.replace("{count}", String(staged.length))}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStaged([])}
              >
                {copy.uploadDiscard}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isUploading}
                onClick={confirmStagedUpload}
              >
                {isUploading ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" />
                    {copy.uploadConfirming}
                  </>
                ) : (
                  copy.uploadConfirm
                )}
              </Button>
            </>
          ) : null}
        </div>

        {staged.length > 0 ? (
          <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
            {staged.map((s, idx) => (
              <li
                key={`${s.file_path}-${idx}`}
                className="relative aspect-square overflow-hidden rounded-md bg-muted"
              >
                {s.kind === "image" ? (
                  <ImageKitProvider
                    urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                  >
                    <Image
                      src={s.file_path}
                      width={500}
                      height={500}
                      alt="cover image"
                    />
                  </ImageKitProvider>
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-wide text-muted-foreground">
                    video
                  </div>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setStaged((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="absolute top-1 end-1 inline-flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                  aria-label="remove"
                >
                  <IconX className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">
            {copy.filterTags}
          </Label>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{copy.filterAll}</SelectItem>
              {allTags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">
            {copy.filterVisibility}
          </Label>
          <Select
            value={visibilityFilter}
            onValueChange={(v) =>
              setVisibilityFilter(v as "all" | MediaVisibilityValue)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{copy.filterAll}</SelectItem>
              <SelectItem value="public">{copy.visibilityPublic}</SelectItem>
              <SelectItem value="private">{copy.visibilityPrivate}</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          )}
        </div>
      </div>

      {/* Grid */}
      {displayItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center text-sm text-muted-foreground">
          {copy.empty}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayItems.map((it, idx) => {
            const isPending = pendingId === it.id;
            const caption = locale === "ar" ? it.caption_ar : it.caption_en;
            return (
              <li
                key={it.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border border-border bg-card flex flex-col justify-between",
                )}
              >
                <div className="relative aspect-square bg-card">
                  {it.kind === "image" ? (
                    <ImageKitProvider
                      urlEndpoint={
                        process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                      }
                    >
                      <Image
                        src={it.file_path}
                        width={500}
                        height={500}
                        alt="cover image"
                      />
                    </ImageKitProvider>
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-wide text-muted-foreground bg-muted">
                      {it.kind}
                    </div>
                  )}
                  <span
                    className={cn(
                      "absolute top-1.5 start-1.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm",
                    )}
                  >
                    {it.visibility === "private" ? (
                      <>
                        <IconLock className="size-2.5" />
                        {copy.visibilityPrivate}
                      </>
                    ) : (
                      <>
                        <IconEye className="size-2.5" />
                        {copy.visibilityPublic}
                      </>
                    )}
                  </span>
                </div>
                <div className="space-y-2 p-2.5">
                  <p className="line-clamp-2 min-h-[2.5em] text-xs text-muted-foreground">
                    {caption ?? "—"}
                  </p>
                  {it.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {it.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                      {it.tags.length > 3 ? (
                        <span className="text-[10px] text-muted-foreground">
                          +{it.tags.length - 3}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {reorderMode ? (
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={idx === 0}
                          onClick={() => moveReorder(idx, -1)}
                        >
                          <IconArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={idx === displayItems.length - 1}
                          onClick={() => moveReorder(idx, 1)}
                        >
                          <IconArrowDown className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title={copy.edit}
                        onClick={() => setEditing(it)}
                      >
                        <IconPencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title={copy.delete}
                        disabled={isPending}
                        onClick={() => setConfirmDelete(it)}
                      >
                        {isPending ? (
                          <IconLoader2 className="size-3.5 animate-spin" />
                        ) : (
                          <IconTrash className="size-3.5 text-red-600 dark:text-red-400" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <EditDrawer
        key={editing?.id ?? "none"}
        item={editing}
        onClose={() => setEditing(null)}
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

function EditDrawer({
  item,
  onClose,
  locale,
  copy,
}: {
  item: StudioRow | null;
  onClose: () => void;
  locale: "ar" | "en";
  copy: StudioAdminCopy;
}) {
  const [captionEn, setCaptionEn] = useState(item?.caption_en ?? "");
  const [captionAr, setCaptionAr] = useState(item?.caption_ar ?? "");
  const [tagsInput, setTagsInput] = useState((item?.tags ?? []).join(", "));
  const [visibility, setVisibility] = useState<MediaVisibilityValue>(
    item?.visibility ?? "public",
  );
  const [isPending, startTransition] = useTransition();

  function save() {
    if (!item) return;
    startTransition(async () => {
      const res = await updateStudioItem(
        {
          id: item.id,
          caption_en: captionEn,
          caption_ar: captionAr,
          tags: parseTags(tagsInput),
          visibility,
        },
        locale,
      );
      if (res.ok) {
        toast.success(copy.successUpdated);
        onClose();
      } else if (res.code === "validation") {
        toast.error(copy.errorValidation);
      } else if (res.code === "unauthorized") {
        toast.error(copy.errorUnauthorized);
      } else {
        toast.error(copy.errorGeneric);
      }
    });
  }

  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side={locale === "ar" ? "left" : "right"}
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{copy.editTitle}</SheetTitle>
          <SheetDescription>{copy.editSubtitle}</SheetDescription>
        </SheetHeader>

        {item ? (
          <div className="space-y-4 px-4 pb-6">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              {item.kind === "image" ? (
                <ImageKitProvider
                  urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                >
                  <Image
                    src={item.file_path}
                    width={500}
                    height={500}
                    alt="cover image"
                  />
                </ImageKitProvider>
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-wide text-muted-foreground">
                  {item.kind}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="cap-en">{copy.formCaptionEn}</Label>
              <Input
                id="cap-en"
                dir="ltr"
                value={captionEn}
                onChange={(e) => setCaptionEn(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="cap-ar">{copy.formCaptionAr}</Label>
              <Input
                id="cap-ar"
                dir="rtl"
                value={captionAr}
                onChange={(e) => setCaptionAr(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="cap-tags">{copy.formTags}</Label>
              <Input
                id="cap-tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {copy.formTagsHint}
              </p>
            </div>
            <div>
              <Label className="mb-2 block">{copy.formVisibility}</Label>
              <Select
                value={visibility}
                onValueChange={(v) => setVisibility(v as MediaVisibilityValue)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <span className="inline-flex items-center gap-2">
                      <IconEye className="size-3.5" />
                      {copy.visibilityPublic}
                    </span>
                  </SelectItem>
                  <SelectItem value="private">
                    <span className="inline-flex items-center gap-2">
                      <IconEyeOff className="size-3.5" />
                      {copy.visibilityPrivate}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                {copy.cancel}
              </Button>
              <Button type="button" onClick={save} disabled={isPending}>
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
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
