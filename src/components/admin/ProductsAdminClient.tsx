"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconStar,
  IconStarFilled,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageKitImage } from "@/components/imagekit/ImageKitImage";
import { ImageKitUploader } from "@/components/imagekit/ImageKitUploader";
import {
  upsertProduct,
  deleteProduct,
} from "@/app/[locale]/admin/products/actions";

export type ProductRow = {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  category_en: string | null;
  category_ar: string | null;
  price_sar: number;
  compare_at_sar: number | null;
  stock: number;
  cover_image_path: string | null;
  gallery_paths: string[];
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

export type ProductsAdminCopy = {
  newProduct: string;
  search: string;
  empty: string;
  colImage: string;
  colName: string;
  colCategory: string;
  colPrice: string;
  colStock: string;
  colStatus: string;
  colActions: string;
  edit: string;
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
  formNameEn: string;
  formNameAr: string;
  formDescriptionEn: string;
  formDescriptionAr: string;
  formCategoryEn: string;
  formCategoryAr: string;
  formPrice: string;
  formCompareAt: string;
  formStock: string;
  formStatus: string;
  formFeatured: string;
  formSortOrder: string;
  formCover: string;
  formCoverHint: string;
  formCoverAdd: string;
  formCoverReplace: string;
  formCoverRemove: string;
  statusDraft: string;
  statusPublished: string;
  statusArchived: string;
  save: string;
  saving: string;
  toastCreated: string;
  toastUpdated: string;
  toastDeleted: string;
  errorValidation: string;
  errorConflict: string;
  errorGeneric: string;
  sar: string;
};

const STATUSES = ["draft", "published", "archived"] as const;

export function ProductsAdminClient({
  locale,
  rows,
  copy,
}: {
  locale: "ar" | "en";
  rows: ProductRow[];
  copy: ProductsAdminCopy;
}) {
  const [items, setItems] = useState<ProductRow[]>(rows);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ProductRow | null>(null);
  const [search, setSearch] = useState("");
  const [pendingDelete, startDelete] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name_en.toLowerCase().includes(q) ||
        i.name_ar.toLowerCase().includes(q) ||
        i.slug.toLowerCase().includes(q),
    );
  }, [items, search]);

  function handleSaved(saved: ProductRow, mode: "create" | "update") {
    setItems((prev) => {
      if (mode === "create") return [saved, ...prev];
      return prev.map((i) => (i.id === saved.id ? saved : i));
    });
    toast.success(mode === "create" ? copy.toastCreated : copy.toastUpdated);
  }

  function handleDelete(row: ProductRow) {
    startDelete(async () => {
      const res = await deleteProduct({ id: row.id }, locale);
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== row.id));
        toast.success(copy.toastDeleted);
      } else {
        toast.error(copy.errorGeneric);
      }
      setConfirmDelete(null);
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Input
          placeholder={copy.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => setCreating(true)} className="ms-auto">
          <IconPlus className="size-4 me-1.5" />
          {copy.newProduct}
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-16">{copy.colImage}</TableHead>
              <TableHead>{copy.colName}</TableHead>
              <TableHead>{copy.colCategory}</TableHead>
              <TableHead>{copy.colPrice}</TableHead>
              <TableHead>{copy.colStock}</TableHead>
              <TableHead>{copy.colStatus}</TableHead>
              <TableHead className="w-32 text-end">{copy.colActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="p-8 text-center text-sm text-muted-foreground"
                >
                  {copy.empty}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const name = locale === "ar" ? p.name_ar : p.name_en;
                const cat = locale === "ar" ? p.category_ar : p.category_en;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="size-12 overflow-hidden rounded-md bg-muted/50">
                        {p.cover_image_path ? (
                          <ImageKitImage
                            src={p.cover_image_path}
                            alt=""
                            width={80}
                            height={80}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-xl">
                            📦
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {p.is_featured ? (
                          <IconStarFilled className="size-3.5 text-brand-gold" />
                        ) : null}
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat ?? "—"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {Number(p.price_sar).toFixed(2)} {copy.sar}
                    </TableCell>
                    <TableCell className="tabular-nums">{p.stock}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "published" ? "default" : "secondary"
                        }
                      >
                        {p.status === "published"
                          ? copy.statusPublished
                          : p.status === "draft"
                          ? copy.statusDraft
                          : copy.statusArchived}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditing(p)}
                        aria-label={copy.edit}
                      >
                        <IconEdit className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirmDelete(p)}
                        aria-label={copy.delete}
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ProductDrawer
        open={creating || editing !== null}
        product={editing}
        locale={locale}
        copy={copy}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSaved={handleSaved}
      />

      {confirmDelete ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">
              {copy.confirmDeleteTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {copy.confirmDeleteBody}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmDelete(null)}
                disabled={pendingDelete}
              >
                {copy.cancel}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDelete(confirmDelete)}
                disabled={pendingDelete}
              >
                {pendingDelete ? (
                  <IconLoader2 className="size-4 animate-spin me-1.5" />
                ) : null}
                {copy.confirmDeleteCta}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function ProductDrawer({
  open,
  product,
  locale,
  copy,
  onClose,
  onSaved,
}: {
  open: boolean;
  product: ProductRow | null;
  locale: "ar" | "en";
  copy: ProductsAdminCopy;
  onClose: () => void;
  onSaved: (saved: ProductRow, mode: "create" | "update") => void;
}) {
  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [catEn, setCatEn] = useState("");
  const [catAr, setCatAr] = useState("");
  const [price, setPrice] = useState<string>("");
  const [compareAt, setCompareAt] = useState<string>("");
  const [stock, setStock] = useState<string>("0");
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    "draft",
  );
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState<string>("0");
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Reset / hydrate when drawer toggles or product changes.
  useMemo(() => {
    if (!open) return;
    if (product) {
      setSlug(product.slug);
      setNameEn(product.name_en);
      setNameAr(product.name_ar);
      setDescEn(product.description_en ?? "");
      setDescAr(product.description_ar ?? "");
      setCatEn(product.category_en ?? "");
      setCatAr(product.category_ar ?? "");
      setPrice(String(product.price_sar));
      setCompareAt(
        product.compare_at_sar !== null ? String(product.compare_at_sar) : "",
      );
      setStock(String(product.stock));
      setStatus(product.status);
      setFeatured(product.is_featured);
      setSortOrder(String(product.sort_order));
      setCoverPath(product.cover_image_path);
    } else {
      setSlug("");
      setNameEn("");
      setNameAr("");
      setDescEn("");
      setDescAr("");
      setCatEn("");
      setCatAr("");
      setPrice("");
      setCompareAt("");
      setStock("0");
      setStatus("draft");
      setFeatured(false);
      setSortOrder("0");
      setCoverPath(null);
    }
  }, [open, product]);

  function submit() {
    startTransition(async () => {
      const payload = {
        id: product?.id,
        slug: slug.trim() || slugify(nameEn || nameAr),
        name_en: nameEn.trim(),
        name_ar: nameAr.trim(),
        description_en: descEn.trim() || null,
        description_ar: descAr.trim() || null,
        category_en: catEn.trim() || null,
        category_ar: catAr.trim() || null,
        price_sar: Number(price),
        compare_at_sar: compareAt ? Number(compareAt) : null,
        stock: Number(stock),
        cover_image_path: coverPath,
        gallery_paths: [],
        status,
        is_featured: featured,
        sort_order: Number(sortOrder),
      };

      const res = await upsertProduct(payload, locale);
      if (res.ok) {
        const saved: ProductRow = {
          id: res.data.id,
          slug: payload.slug,
          name_en: payload.name_en,
          name_ar: payload.name_ar,
          description_en: payload.description_en,
          description_ar: payload.description_ar,
          category_en: payload.category_en,
          category_ar: payload.category_ar,
          price_sar: payload.price_sar,
          compare_at_sar: payload.compare_at_sar,
          stock: payload.stock,
          cover_image_path: payload.cover_image_path,
          gallery_paths: [],
          status: payload.status,
          is_featured: payload.is_featured,
          sort_order: payload.sort_order,
          created_at: product?.created_at ?? new Date().toISOString(),
        };
        onSaved(saved, product ? "update" : "create");
        onClose();
      } else {
        const msg =
          res.code === "validation"
            ? copy.errorValidation
            : res.code === "conflict"
            ? copy.errorConflict
            : copy.errorGeneric;
        toast.error(msg);
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side={locale === "ar" ? "left" : "right"}
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>
            {product ? copy.drawerEditTitle : copy.drawerCreateTitle}
          </SheetTitle>
          <SheetDescription>{copy.drawerSubtitle}</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-6 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="nameEn">{copy.formNameEn}</Label>
              <Input
                id="nameEn"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="mt-1.5"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="nameAr">{copy.formNameAr}</Label>
              <Input
                id="nameAr"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="mt-1.5"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="slug">{copy.formSlug}</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1.5 font-mono"
              dir="ltr"
              placeholder={slugify(nameEn || nameAr)}
            />
            <p className="mt-1 text-xs text-muted-foreground">{copy.formSlugHint}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="catEn">{copy.formCategoryEn}</Label>
              <Input
                id="catEn"
                value={catEn}
                onChange={(e) => setCatEn(e.target.value)}
                className="mt-1.5"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="catAr">{copy.formCategoryAr}</Label>
              <Input
                id="catAr"
                value={catAr}
                onChange={(e) => setCatAr(e.target.value)}
                className="mt-1.5"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="price">{copy.formPrice}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1.5"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="compareAt">{copy.formCompareAt}</Label>
              <Input
                id="compareAt"
                type="number"
                step="0.01"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                className="mt-1.5"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="stock">{copy.formStock}</Label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1.5"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="descEn">{copy.formDescriptionEn}</Label>
              <Textarea
                id="descEn"
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                className="mt-1.5"
                rows={3}
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="descAr">{copy.formDescriptionAr}</Label>
              <Textarea
                id="descAr"
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                className="mt-1.5"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>{copy.formStatus}</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as typeof status)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
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
            </div>
            <div>
              <Label htmlFor="sortOrder">{copy.formSortOrder}</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="mt-1.5"
                dir="ltr"
              />
            </div>
            <div className="flex items-end">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="size-4 accent-brand-gold"
                />
                <span className="text-sm">
                  {featured ? <IconStarFilled className="inline size-4 text-brand-gold me-1" /> : <IconStar className="inline size-4 me-1" />}
                  {copy.formFeatured}
                </span>
              </label>
            </div>
          </div>

          <div>
            <Label>{copy.formCover}</Label>
            <p className="mt-1 mb-3 text-xs text-muted-foreground">
              {copy.formCoverHint}
            </p>
            <div className="flex items-center gap-4">
              <div className="size-24 overflow-hidden rounded-md bg-muted/50">
                {coverPath ? (
                  <ImageKitImage
                    src={coverPath}
                    alt=""
                    width={200}
                    height={200}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-3xl">
                    📦
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <ImageKitUploader
                  folder="/public/projects"
                  accept="image/*"
                  maxSizeMB={8}
                  label={coverPath ? copy.formCoverReplace : copy.formCoverAdd}
                  onUploaded={(results) => {
                    if (results[0]) setCoverPath(results[0].filePath);
                  }}
                />
                {coverPath ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCoverPath(null)}
                  >
                    {copy.formCoverRemove}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              {copy.cancel}
            </Button>
            <Button type="button" onClick={submit} disabled={pending}>
              {pending ? (
                <IconLoader2 className="size-4 animate-spin me-1.5" />
              ) : null}
              {pending ? copy.saving : copy.save}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
