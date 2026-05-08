"use server";

import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkoutSchema } from "@/lib/validation/order";
import { sendMail } from "@/lib/email/send";

type ActionResult =
  | { ok: true; orderId: string; orderNumber: string }
  | {
      ok: false;
      code: "validation" | "stock" | "not_found" | "server_error";
      reason?: string;
    };

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BP-${ts}-${r}`;
}

export async function placeOrder(raw: unknown): Promise<ActionResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "validation", reason: parsed.error.issues[0]?.message };
  }
  const input = parsed.data;
  const admin = createSupabaseAdminClient();

  const ids = input.items.map((i) => i.productId);
  const { data: productRows, error: pErr } = await admin
    .from("products")
    .select("id,name_en,name_ar,price_sar,stock,status")
    .in("id", ids);
  if (pErr || !productRows) {
    console.error("[checkout] product lookup failed", pErr);
    return { ok: false, code: "server_error" };
  }
  type ProductRow = {
    id: string;
    name_en: string;
    name_ar: string;
    price_sar: number;
    stock: number;
    status: string;
  };
  const products = new Map<string, ProductRow>();
  for (const row of productRows as unknown as ProductRow[]) {
    products.set(row.id, row);
  }

  let subtotal = 0;
  const orderItems: Array<{
    product_id: string;
    name_snapshot: string;
    price_sar: number;
    quantity: number;
    line_total_sar: number;
  }> = [];
  for (const it of input.items) {
    const p = products.get(it.productId);
    if (!p || p.status !== "published") {
      return { ok: false, code: "not_found", reason: it.productId };
    }
    if (p.stock < it.quantity) {
      return { ok: false, code: "stock", reason: p.id };
    }
    const line = Number(p.price_sar) * it.quantity;
    subtotal += line;
    orderItems.push({
      product_id: p.id,
      name_snapshot: input.locale === "ar" ? p.name_ar : p.name_en,
      price_sar: Number(p.price_sar),
      quantity: it.quantity,
      line_total_sar: line,
    });
  }

  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal + shipping;
  const orderNumber = generateOrderNumber();

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    null;

  const orderPayload = {
    order_number: orderNumber,
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    shipping_address: input.shippingAddress,
    city: input.city,
    notes: input.notes,
    subtotal_sar: subtotal,
    shipping_sar: shipping,
    total_sar: total,
    status: "pending_payment" as const,
    ip_address: ip,
  };

  const { data: orderData, error: oErr } = await admin
    .from("orders")
    .insert(orderPayload as never)
    .select("id")
    .single();
  if (oErr || !orderData) {
    console.error("[checkout] order insert failed", oErr);
    return { ok: false, code: "server_error" };
  }
  const orderId = (orderData as unknown as { id: string }).id;

  const itemRows = orderItems.map((i) => ({ ...i, order_id: orderId }));
  const { error: iErr } = await admin
    .from("order_items")
    .insert(itemRows as never);
  if (iErr) {
    console.error("[checkout] order_items insert failed", iErr);
    await admin.from("orders").delete().eq("id", orderId);
    return { ok: false, code: "server_error" };
  }

  for (const it of input.items) {
    const p = products.get(it.productId);
    if (!p) continue;
    await admin
      .from("products")
      .update({ stock: Math.max(0, p.stock - it.quantity) } as never)
      .eq("id", p.id);
  }

  try {
    await sendMail({
      to: input.email,
      template: "order-confirmation",
      data: {
        fullName: input.fullName,
        orderNumber,
        total: total.toFixed(2),
      },
      locale: input.locale,
    });
  } catch (e) {
    console.warn("[checkout] confirmation email failed", e);
  }

  return { ok: true, orderId, orderNumber };
}
