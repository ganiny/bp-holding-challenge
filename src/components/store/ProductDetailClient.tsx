"use client";

import { useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { ImageKitImage } from "@/components/imagekit/ImageKitImage";
import {
  IconShoppingCartPlus,
  IconCheck,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react";

type Product = {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description: string | null;
  category: string | null;
  price_sar: number;
  compare_at_sar: number | null;
  cover_image_path: string | null;
  gallery_paths: string[];
  stock: number;
};

type Copy = {
  addToCart: string;
  added: string;
  outOfStock: string;
  sar: string;
  inStock: string;
  quantity: string;
  buyNow: string;
};

export function ProductDetailClient({
  product,
  locale,
  copy,
}: {
  product: Product;
  locale: "ar" | "en";
  copy: Copy;
}) {
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(product.cover_image_path);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const name = locale === "ar" ? product.name_ar : product.name_en;
  const outOfStock = product.stock <= 0;
  const onSale =
    product.compare_at_sar !== null && product.compare_at_sar > product.price_sar;

  function add() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name_en: product.name_en,
        name_ar: product.name_ar,
        price_sar: product.price_sar,
        cover_image_path: product.cover_image_path,
      },
      qty,
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  function buyNow() {
    add();
    router.push("/cart");
  }

  const allImages = [product.cover_image_path, ...product.gallery_paths].filter(
    (s): s is string => Boolean(s),
  );

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-linear-to-br from-brand-navy/10 to-brand-gold/5">
          {activeImg ? (
            <ImageKitImage
              src={activeImg}
              alt={name}
              width={900}
              height={900}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-brand-navy/40">
              <span className="text-9xl">📦</span>
            </div>
          )}
          {onSale ? (
            <span className="absolute start-4 top-4 rounded-full bg-brand-gold px-3 py-1 text-xs font-mono uppercase tracking-wider text-brand-navy">
              -
              {Math.round(
                ((product.compare_at_sar! - product.price_sar) /
                  product.compare_at_sar!) *
                  100,
              )}
              %
            </span>
          ) : null}
        </div>
        {allImages.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto">
            {allImages.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImg(src)}
                className={`relative size-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                  activeImg === src ? "border-brand-gold" : "border-border"
                }`}
              >
                <ImageKitImage
                  src={src}
                  alt=""
                  width={160}
                  height={160}
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col">
        {product.category ? (
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-brand-gold">
            {product.category}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {name}
        </h1>

        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-3xl font-semibold text-brand-navy dark:text-brand-gold">
            {product.price_sar.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">{copy.sar}</span>
          {onSale ? (
            <span className="text-lg text-muted-foreground line-through">
              {product.compare_at_sar!.toFixed(2)}
            </span>
          ) : null}
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {outOfStock
            ? copy.outOfStock
            : `${copy.inStock} (${product.stock})`}
        </p>

        {product.description ? (
          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        ) : null}

        <div className="mt-8 flex items-center gap-3">
          <span className="text-sm font-medium">{copy.quantity}:</span>
          <div className="flex items-center rounded-md border border-border">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="-"
            >
              <IconMinus className="size-4" />
            </button>
            <span className="w-12 text-center text-sm tabular-nums">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="+"
            >
              <IconPlus className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={add}
            disabled={outOfStock}
            variant={justAdded ? "outline" : "default"}
            className="flex-1"
            size="lg"
          >
            {justAdded ? (
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
          <Button
            type="button"
            onClick={buyNow}
            disabled={outOfStock}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            {copy.buyNow}
          </Button>
        </div>
      </div>
    </div>
  );
}
