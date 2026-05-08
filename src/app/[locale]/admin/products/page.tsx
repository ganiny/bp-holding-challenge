import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ProductsAdminClient,
  type ProductRow,
} from "@/components/admin/ProductsAdminClient";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.productsAdmin");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id,slug,name_en,name_ar,description_en,description_ar,category_en,category_ar,price_sar,compare_at_sar,stock,cover_image_path,gallery_paths,status,is_featured,sort_order,created_at",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const rows = ((data ?? []) as unknown as ProductRow[]).map((r) => ({
    ...r,
    price_sar: Number(r.price_sar),
    compare_at_sar: r.compare_at_sar !== null ? Number(r.compare_at_sar) : null,
    gallery_paths: r.gallery_paths ?? [],
  }));

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("lead")}</p>
      </header>

      <ProductsAdminClient
        locale={localeTyped}
        rows={rows}
        copy={{
          newProduct: t("newProduct"),
          search: t("search"),
          empty: t("empty"),
          colImage: t("table.image"),
          colName: t("table.name"),
          colCategory: t("table.category"),
          colPrice: t("table.price"),
          colStock: t("table.stock"),
          colStatus: t("table.status"),
          colActions: t("table.actions"),
          edit: t("actions.edit"),
          delete: t("actions.delete"),
          cancel: t("actions.cancel"),
          confirmDeleteTitle: t("confirmDelete.title"),
          confirmDeleteBody: t("confirmDelete.body"),
          confirmDeleteCta: t("confirmDelete.cta"),
          drawerCreateTitle: t("drawer.createTitle"),
          drawerEditTitle: t("drawer.editTitle"),
          drawerSubtitle: t("drawer.subtitle"),
          formSlug: t("form.slug"),
          formSlugHint: t("form.slugHint"),
          formNameEn: t("form.nameEn"),
          formNameAr: t("form.nameAr"),
          formDescriptionEn: t("form.descriptionEn"),
          formDescriptionAr: t("form.descriptionAr"),
          formCategoryEn: t("form.categoryEn"),
          formCategoryAr: t("form.categoryAr"),
          formPrice: t("form.price"),
          formCompareAt: t("form.compareAt"),
          formStock: t("form.stock"),
          formStatus: t("form.status"),
          formFeatured: t("form.featured"),
          formSortOrder: t("form.sortOrder"),
          formCover: t("form.cover"),
          formCoverHint: t("form.coverHint"),
          formCoverAdd: t("form.coverAdd"),
          formCoverReplace: t("form.coverReplace"),
          formCoverRemove: t("form.coverRemove"),
          statusDraft: t("status.draft"),
          statusPublished: t("status.published"),
          statusArchived: t("status.archived"),
          save: t("form.save"),
          saving: t("form.saving"),
          toastCreated: t("toast.created"),
          toastUpdated: t("toast.updated"),
          toastDeleted: t("toast.deleted"),
          errorValidation: t("errors.validation"),
          errorConflict: t("errors.conflict"),
          errorGeneric: t("errors.generic"),
          sar: t("sar"),
        }}
      />
    </section>
  );
}
