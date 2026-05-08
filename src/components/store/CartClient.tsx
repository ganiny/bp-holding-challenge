"use client";

import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ImageKitImage } from "@/components/imagekit/ImageKitImage";
import { useCartStore, cartSubtotal } from "@/lib/store/cart-store";
import {
  IconTrash,
  IconMinus,
  IconPlus,
  IconShoppingBag,
} from "@tabler/icons-react";

type Copy = {
  empty: string;
  emptyCta: string;
  product: string;
  price: string;
  quantity: string;
  lineTotal: string;
  remove: string;
  subtotal: string;
  shippingNote: string;
  checkout: string;
  continueShopping: string;
  sar: string;
};

export function CartClient({
  locale,
  copy,
}: {
  locale: "ar" | "en";
  copy: Copy;
}) {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  if (!hasHydrated) {
    return (
      <div className="py-20 text-center text-muted-foreground">…</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <IconShoppingBag className="mx-auto size-16 text-muted-foreground/40" />
        <p className="mt-4 text-lg text-muted-foreground">{copy.empty}</p>
        <Button asChild className="mt-6">
          <Link href="/store">{copy.emptyCta}</Link>
        </Button>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {items.map((item) => {
          const name = locale === "ar" ? item.name_ar : item.name_en;
          const lineTotal = item.price_sar * item.quantity;
          return (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <Link
                href={`/store/${item.slug}`}
                className="relative size-24 shrink-0 overflow-hidden rounded-md bg-linear-to-br from-brand-navy/10 to-brand-gold/5"
              >
                {item.cover_image_path ? (
                  <ImageKitImage
                    src={item.cover_image_path}
                    alt={name}
                    width={200}
                    height={200}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-3xl text-brand-navy/40">
                    📦
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <Link
                  href={`/store/${item.slug}`}
                  className="text-sm font-semibold leading-snug hover:text-brand-navy dark:hover:text-brand-gold"
                >
                  {name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.price_sar.toFixed(2)} {copy.sar}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label="-"
                    >
                      <IconMinus className="size-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label="+"
                    >
                      <IconPlus className="size-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-semibold">
                    {lineTotal.toFixed(2)} {copy.sar}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={copy.remove}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <IconTrash className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <aside className="h-fit rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">{copy.subtotal}</h2>
        <div className="mt-4 flex items-baseline justify-between border-b border-border pb-4">
          <span className="text-sm text-muted-foreground">{copy.subtotal}</span>
          <span className="text-xl font-semibold text-brand-navy dark:text-brand-gold">
            {subtotal.toFixed(2)} {copy.sar}
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{copy.shippingNote}</p>
        <Button asChild size="lg" className="mt-5 w-full">
          <Link href="/checkout">{copy.checkout}</Link>
        </Button>
        <Button asChild variant="outline" className="mt-3 w-full">
          <Link href="/store">{copy.continueShopping}</Link>
        </Button>
      </aside>
    </div>
  );
}
