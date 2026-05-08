"use client";

import { Link } from "@/lib/i18n/navigation";
import { IconShoppingCart } from "@tabler/icons-react";
import { useCartStore, cartCount } from "@/lib/store/cart-store";

export function CartIndicator({ label }: { label: string }) {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const count = hasHydrated ? cartCount(items) : 0;

  return (
    <Link
      href="/cart"
      aria-label={label}
      className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <IconShoppingCart className="size-5" />
      {count > 0 ? (
        <span className="absolute -top-0.5 -end-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-semibold text-brand-navy">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
