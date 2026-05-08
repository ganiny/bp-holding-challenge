import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  OrdersAdminClient,
  type OrderRowVM,
  type OrderStatus,
} from "@/components/admin/OrdersAdminClient";

type OrderRow = {
  id: string;
  order_number: string;
  full_name: string;
  email: string;
  phone: string;
  shipping_address: string;
  city: string | null;
  notes: string | null;
  subtotal_sar: number;
  shipping_sar: number;
  total_sar: number;
  status: OrderStatus;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  name_snapshot: string;
  price_sar: number;
  quantity: number;
  line_total_sar: number;
};

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.ordersAdmin");
  const tStatus = await getTranslations("admin.ordersAdmin.status");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const [ordersRes, itemsRes] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id,order_number,full_name,email,phone,shipping_address,city,notes,subtotal_sar,shipping_sar,total_sar,status,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("order_items")
      .select("id,order_id,name_snapshot,price_sar,quantity,line_total_sar"),
  ]);

  const orders = (ordersRes.data ?? []) as unknown as OrderRow[];
  const allItems = (itemsRes.data ?? []) as unknown as OrderItemRow[];
  const itemsByOrder = new Map<string, OrderItemRow[]>();
  for (const it of allItems) {
    const list = itemsByOrder.get(it.order_id) ?? [];
    list.push(it);
    itemsByOrder.set(it.order_id, list);
  }

  const rows: OrderRowVM[] = orders.map((o) => ({
    ...o,
    subtotal_sar: Number(o.subtotal_sar),
    shipping_sar: Number(o.shipping_sar),
    total_sar: Number(o.total_sar),
    items: (itemsByOrder.get(o.id) ?? []).map((i) => ({
      id: i.id,
      name_snapshot: i.name_snapshot,
      price_sar: Number(i.price_sar),
      quantity: i.quantity,
      line_total_sar: Number(i.line_total_sar),
    })),
  }));

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("lead")}</p>
      </header>

      <OrdersAdminClient
        locale={localeTyped}
        rows={rows}
        copy={{
          search: t("search"),
          filterStatus: t("filterStatus"),
          filterAll: t("filterAll"),
          empty: t("empty"),
          colOrder: t("table.order"),
          colCustomer: t("table.customer"),
          colTotal: t("table.total"),
          colStatus: t("table.status"),
          colCreated: t("table.created"),
          colExpand: t("table.expand"),
          expand: t("expand"),
          collapse: t("collapse"),
          detailsItems: t("details.items"),
          detailsAddress: t("details.address"),
          detailsNotes: t("details.notes"),
          detailsContact: t("details.contact"),
          status: {
            pending_payment: tStatus("pending_payment"),
            paid: tStatus("paid"),
            processing: tStatus("processing"),
            shipped: tStatus("shipped"),
            delivered: tStatus("delivered"),
            cancelled: tStatus("cancelled"),
            refunded: tStatus("refunded"),
          },
          toastUpdated: t("toast.updated"),
          errorGeneric: t("errors.generic"),
          sar: t("sar"),
        }}
      />
    </section>
  );
}
