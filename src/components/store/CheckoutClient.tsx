"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCartStore, cartSubtotal } from "@/lib/store/cart-store";
import { placeOrder } from "@/app/[locale]/(marketing)/checkout/actions";

const formSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(5).max(40),
  shippingAddress: z.string().min(5).max(500),
  city: z.string().max(120),
  notes: z.string().max(1000),
});

type FormValues = z.infer<typeof formSchema>;

export type CheckoutCopy = {
  emptyTitle: string;
  emptyCta: string;
  contactSection: string;
  shippingSection: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  addressPlaceholder: string;
  city: string;
  notes: string;
  notesPlaceholder: string;
  summary: string;
  subtotal: string;
  shipping: string;
  shippingFree: string;
  total: string;
  placeOrder: string;
  placing: string;
  successToast: string;
  errorGeneric: string;
  errorStock: string;
  sar: string;
  paymentNote: string;
};

export function CheckoutClient({
  locale,
  copy,
}: {
  locale: "ar" | "en";
  copy: CheckoutCopy;
}) {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clear = useCartStore((s) => s.clear);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: (zodResolver as unknown as (s: unknown) => Resolver<FormValues>)(
      formSchema,
    ),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      shippingAddress: "",
      city: "",
      notes: "",
    },
  });

  if (!hasHydrated) {
    return <p className="py-20 text-center text-muted-foreground">…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted-foreground">{copy.emptyTitle}</p>
        <Button
          className="mt-6"
          onClick={() => router.push("/store")}
          type="button"
        >
          {copy.emptyCta}
        </Button>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal + shipping;

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await placeOrder({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        shippingAddress: values.shippingAddress,
        city: values.city || null,
        notes: values.notes || null,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        locale,
      });

      if (res.ok) {
        toast.success(copy.successToast);
        clear();
        router.push(`/order-confirmed/${res.orderNumber}`);
      } else {
        const msg = res.code === "stock" ? copy.errorStock : copy.errorGeneric;
        setErrorMsg(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{copy.contactSection}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">{copy.fullName}</Label>
              <Input id="fullName" {...register("fullName")} className="mt-1.5" />
              {errors.fullName ? (
                <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="phone">{copy.phone}</Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                className="mt-1.5"
                dir="ltr"
              />
              {errors.phone ? (
                <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">{copy.email}</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1.5"
                dir="ltr"
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{copy.shippingSection}</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="shippingAddress">{copy.address}</Label>
              <Textarea
                id="shippingAddress"
                {...register("shippingAddress")}
                placeholder={copy.addressPlaceholder}
                rows={3}
                className="mt-1.5"
              />
              {errors.shippingAddress ? (
                <p className="mt-1 text-xs text-destructive">{errors.shippingAddress.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="city">{copy.city}</Label>
              <Input id="city" {...register("city")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="notes">{copy.notes}</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder={copy.notesPlaceholder}
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">{copy.summary}</h2>
        <ul className="mt-4 space-y-2 border-b border-border pb-4 text-sm">
          {items.map((i) => {
            const name = locale === "ar" ? i.name_ar : i.name_en;
            return (
              <li
                key={i.productId}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="line-clamp-2 text-muted-foreground">
                  {name} × {i.quantity}
                </span>
                <span className="shrink-0 tabular-nums">
                  {(i.price_sar * i.quantity).toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{copy.subtotal}</span>
            <span className="tabular-nums">{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{copy.shipping}</span>
            <span className="tabular-nums">
              {shipping === 0 ? copy.shippingFree : shipping.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
          <span className="font-semibold">{copy.total}</span>
          <span className="text-xl font-semibold text-brand-navy dark:text-brand-gold">
            {total.toFixed(2)} {copy.sar}
          </span>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{copy.paymentNote}</p>

        {errorMsg ? (
          <p className="mt-3 text-sm text-destructive">{errorMsg}</p>
        ) : null}

        <Button type="submit" disabled={isPending} className="mt-5 w-full" size="lg">
          {isPending ? copy.placing : copy.placeOrder}
        </Button>
      </aside>
    </form>
  );
}
