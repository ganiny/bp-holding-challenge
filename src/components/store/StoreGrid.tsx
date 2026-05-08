"use client";

import { useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { ImageKitImage } from "@/components/imagekit/ImageKitImage";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { IconShoppingCartPlus, IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type StoreCard = {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  category: string | null;
  price_sar: number;
  compare_at_sar: number | null;
  cover_image_path: string | null;
  stock: number;
};

type Copy = {
  view: string;
  addToCart: string;
  added: string;
  outOfStock: string;
  sar: string;
  noResults: string;
  filterAll: string;
};

export function StoreGrid({
  products,
  locale,
  categories,
  copy,
}: {
  products: StoreCard[];
  locale: "ar" | "en";
  categories: string[];
  copy: Copy;
}) {
  const [activeCat, setActiveCat] = useState<string>("");
  const filtered = activeCat
    ? products.filter((p) => p.category === activeCat)
    : products;

  return (
    <div>
      {categories.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCat("")}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              activeCat === ""
                ? "border-brand-gold bg-brand-gold/10 text-brand-navy dark:text-brand-cream"
                : "border-border text-muted-foreground hover:border-brand-gold/40 hover:text-foreground",
            )}
          >
            {copy.filterAll}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCat(c)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                activeCat === c
                  ? "border-brand-gold bg-brand-gold/10 text-brand-navy dark:text-brand-cream"
                  : "border-border text-muted-foreground hover:border-brand-gold/40 hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{copy.noResults}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} locale={locale} copy={copy} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  locale,
  copy,
}: {
  product: StoreCard;
  locale: "ar" | "en";
  copy: Copy;
}) {
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const name = locale === "ar" ? product.name_ar : product.name_en;
  const outOfStock = product.stock <= 0;
  const onSale =
    product.compare_at_sar !== null && product.compare_at_sar > product.price_sar;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name_en: product.name_en,
        name_ar: product.name_ar,
        price_sar: product.price_sar,
        cover_image_path: product.cover_image_path,
      },
      1,
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-brand-gold/40 hover:-translate-y-0.5">
      <Link href={`/store/${product.slug}`} className="relative block aspect-4/3 overflow-hidden bg-linear-to-br from-brand-navy/10 to-brand-gold/5">
        {product.cover_image_path ? (
          <ImageKitImage
            src={product.cover_image_path}
            alt={name}
            width={800}
            height={600}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-brand-navy/40">
            <span className="text-6xl">📦</span>
          </div>
        )}
        {onSale ? (
          <span className="absolute start-3 top-3 rounded-full bg-brand-gold px-3 py-1 text-xs font-mono uppercase tracking-wider text-brand-navy">
            -
            {Math.round(
              ((product.compare_at_sar! - product.price_sar) /
                product.compare_at_sar!) *
                100,
            )}
            %
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {product.category ? (
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-brand-gold">
            {product.category}
          </p>
        ) : null}
        <h3 className="mt-2 text-base font-semibold leading-snug">
          <Link href={`/store/${product.slug}`} className="hover:text-brand-navy dark:hover:text-brand-gold">
            {name}
          </Link>
        </h3>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-xl font-semibold text-brand-navy dark:text-brand-gold">
            {product.price_sar.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground">{copy.sar}</span>
          {onSale ? (
            <span className="text-sm text-muted-foreground line-through">
              {product.compare_at_sar!.toFixed(2)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-5">
          <Button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className="w-full"
            variant={justAdded ? "outline" : "default"}
          >
            {outOfStock ? (
              copy.outOfStock
            ) : justAdded ? (
              <>
                <IconCheck className="size-4 me-2" />
                {copy.added}
              </>
            ) : (
              <>
                <IconShoppingCartPlus className="size-4 me-2" />
                {copy.addToCart}
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
