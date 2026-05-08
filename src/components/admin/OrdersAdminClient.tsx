"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";
import { toast } from "sonner";
import {
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
} from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateOrderStatus } from "@/app/[locale]/admin/orders/actions";

export type OrderRowVM = {
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
  items: Array<{
    id: string;
    name_snapshot: string;
    price_sar: number;
    quantity: number;
    line_total_sar: number;
  }>;
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

const STATUSES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export type OrdersAdminCopy = {
  search: string;
  filterStatus: string;
  filterAll: string;
  empty: string;
  colOrder: string;
  colCustomer: string;
  colTotal: string;
  colStatus: string;
  colCreated: string;
  colExpand: string;
  expand: string;
  collapse: string;
  detailsItems: string;
  detailsAddress: string;
  detailsNotes: string;
  detailsContact: string;
  status: Record<OrderStatus, string>;
  toastUpdated: string;
  errorGeneric: string;
  sar: string;
};

export function OrdersAdminClient({
  locale,
  rows,
  copy,
}: {
  locale: "ar" | "en";
  rows: OrderRowVM[];
  copy: OrdersAdminCopy;
}) {
  const [items, setItems] = useState<OrderRowVM[]>(rows);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dateLocale = locale === "ar" ? arLocale : enUS;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.full_name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    });
  }, [items, search, filter]);

  function changeStatus(id: string, status: OrderStatus) {
    startTransition(async () => {
      const res = await updateOrderStatus({ id, status }, locale);
      if (res.ok) {
        setItems((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o)),
        );
        toast.success(copy.toastUpdated);
      } else {
        toast.error(copy.errorGeneric);
      }
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
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as OrderStatus | "all")}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={copy.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copy.filterAll}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {copy.status[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>{copy.colOrder}</TableHead>
              <TableHead>{copy.colCustomer}</TableHead>
              <TableHead>{copy.colTotal}</TableHead>
              <TableHead>{copy.colStatus}</TableHead>
              <TableHead>{copy.colCreated}</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="p-8 text-center text-sm text-muted-foreground"
                >
                  {copy.empty}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => {
                const isOpen = expanded === o.id;
                return (
                  <Fragment key={o.id}>
                    <TableRow aria-expanded={isOpen}>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-0.5 text-xs">
                          {o.order_number}
                        </code>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{o.full_name}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {o.email}
                        </p>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {Number(o.total_sar).toFixed(2)} {copy.sar}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={o.status}
                          onValueChange={(v) =>
                            changeStatus(o.id, v as OrderStatus)
                          }
                          disabled={pending}
                        >
                          <SelectTrigger className="h-8 w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                <Badge
                                  variant={
                                    s === "delivered"
                                      ? "default"
                                      : s === "cancelled" || s === "refunded"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {copy.status[s]}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground" dir="ltr">
                        {format(new Date(o.created_at), "yyyy-MM-dd HH:mm", {
                          locale: dateLocale,
                        })}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          aria-label={isOpen ? copy.collapse : copy.expand}
                          onClick={() => setExpanded(isOpen ? null : o.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isOpen ? (
                            <IconChevronUp className="size-4" />
                          ) : (
                            <IconChevronDown className="size-4" />
                          )}
                        </button>
                      </TableCell>
                    </TableRow>
                    {isOpen ? (
                      <TableRow className="bg-muted/20 hover:bg-muted/20">
                        <TableCell colSpan={6} className="whitespace-normal p-4">
                          <div className="grid gap-4 text-sm md:grid-cols-2">
                            <div>
                              <p className="mb-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                {copy.detailsItems}
                              </p>
                              <ul className="space-y-1">
                                {o.items.map((it) => (
                                  <li
                                    key={it.id}
                                    className="flex justify-between gap-3 border-b border-border pb-1.5 last:border-b-0"
                                  >
                                    <span>
                                      {it.name_snapshot}{" "}
                                      <span className="text-muted-foreground">
                                        × {it.quantity}
                                      </span>
                                    </span>
                                    <span className="tabular-nums">
                                      {Number(it.line_total_sar).toFixed(2)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                  {copy.detailsContact}
                                </p>
                                <p className="mt-1" dir="ltr">{o.phone}</p>
                              </div>
                              <div>
                                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                  {copy.detailsAddress}
                                </p>
                                <p className="mt-1 whitespace-pre-line">
                                  {o.shipping_address}
                                  {o.city ? `\n${o.city}` : ""}
                                </p>
                              </div>
                              {o.notes ? (
                                <div>
                                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                    {copy.detailsNotes}
                                  </p>
                                  <p className="mt-1 whitespace-pre-line">
                                    {o.notes}
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })
            )}
            {pending ? (
              <TableRow>
                <TableCell colSpan={6} className="p-2 text-end">
                  <IconLoader2 className="ms-auto size-4 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
