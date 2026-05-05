"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { TrendPoint } from "@/app/[locale]/admin/page";

type Copy = {
  title: string;
  subtitle: string;
  rfqs: string;
  messages: string;
  jobApplications: string;
  contractors: string;
  empty: string;
};

const SERIES = [
  { key: "rfqs", color: "#df9a13" },
  { key: "messages", color: "#052a42" },
  { key: "jobApplications", color: "#0a7a8c" },
  { key: "contractors", color: "#a35422" },
] as const;

export function DashboardTrends({
  data,
  days,
  locale,
  copy,
}: {
  data: TrendPoint[];
  days: number;
  locale: "ar" | "en";
  copy: Copy;
}) {
  const totals = useMemo(
    () =>
      data.reduce(
        (sum, d) =>
          sum + d.rfqs + d.messages + d.jobApplications + d.contractors,
        0,
      ),
    [data],
  );

  const formatDate = (iso: string) =>
    format(parseISO(iso), locale === "ar" ? "d/M" : "MMM d");

  const labels: Record<(typeof SERIES)[number]["key"], string> = {
    rfqs: copy.rfqs,
    messages: copy.messages,
    jobApplications: copy.jobApplications,
    contractors: copy.contractors,
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{copy.title}</h2>
          <p className="text-xs text-muted-foreground">
            {copy.subtitle.replace("{days}", String(days))}
          </p>
        </div>
      </div>

      {totals === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          {copy.empty}
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              responsive
              data={data}
              margin={locale === 'en' ? { top: 8, right: 12, bottom: 0, left: -16 } : { top: 8, left: 12, bottom: 0, right: -16 }}
            >
              <defs>
                {SERIES.map((s) => (
                  <linearGradient
                    key={s.key}
                    id={`grad-${s.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                reversed={locale === "ar"}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                tickLine={false}
                axisLine={false}
                width={36}
                orientation={locale === "ar" ? "right" : "left"}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
                labelFormatter={(value) => formatDate(String(value))}
                formatter={(value: unknown, name: unknown) => [
                  String(value),
                  labels[name as keyof typeof labels] ?? String(name),
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value) => labels[value as keyof typeof labels] ?? value}
              />
              {SERIES.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  fill={`url(#grad-${s.key})`}
                  strokeWidth={2}
                  stackId="1"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
