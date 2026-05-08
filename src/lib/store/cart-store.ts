"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name_en: string;
  name_ar: string;
  price_sar: number;
  cover_image_path: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  setHasHydrated: (v: boolean) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,
      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(99, i.quantity + qty) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: qty }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.max(1, Math.min(99, qty)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "bp-cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price_sar * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
