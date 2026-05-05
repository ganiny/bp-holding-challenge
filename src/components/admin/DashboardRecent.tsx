"use client";

import { useMemo } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ar as arLocale, enUS as enLocale } from "date-fns/locale";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "@/lib/i18n/navigation";
import { IconArrowRight } from "@tabler/icons-react";
import type {
  RecentRfq,
  RecentMessage,
  RecentJobApp,
  RecentContractor,
} from "@/app/[locale]/admin/page";

type Recent = {
  rfqs: RecentRfq[];
  messages: RecentMessage[];
  jobApps: RecentJobApp[];
  contractors: RecentContractor[];
};

type Copy = {
  title: string;
  subtitle: string;
  tabRfqs: string;
  tabMessages: string;
  tabJobApps: string;
  tabContractors: string;
  empty: string;
  openLabel: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-brand-gold/15 text-brand-gold",
  reviewing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  shortlisted: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
  closed: "bg-muted text-muted-foreground",
  read: "bg-muted text-muted-foreground",
  replied: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  in_progress: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  quoted: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  won: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  lost: "bg-red-500/15 text-red-600 dark:text-red-400",
  hired: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${cls}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function DashboardRecent({
  recent,
  locale,
  copy,
}: {
  recent: Recent;
  locale: "ar" | "en";
  copy: Copy;
}) {
  const dfLocale = locale === "ar" ? arLocale : enLocale;
  const ago = useMemo(
    () => (iso: string) =>
      formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: dfLocale }),
    [dfLocale],
  );

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight">{copy.title}</h2>
        <p className="text-xs text-muted-foreground">{copy.subtitle}</p>
      </div>

      <Tabs defaultValue="rfqs">
        <TabsList className="flex flex-wrap gap-1 bg-muted/50">
          <TabsTrigger value="rfqs">{copy.tabRfqs}</TabsTrigger>
          <TabsTrigger value="messages">{copy.tabMessages}</TabsTrigger>
          <TabsTrigger value="jobApps">{copy.tabJobApps}</TabsTrigger>
          <TabsTrigger value="contractors">{copy.tabContractors}</TabsTrigger>
        </TabsList>

        <TabsContent value="rfqs" className="mt-4">
          {recent.rfqs.length === 0 ? (
            <Empty text={copy.empty} />
          ) : (
            <ul className="divide-y divide-border">
              {recent.rfqs.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{r.full_name}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p
                      className="truncate text-xs text-muted-foreground"
                      dir="ltr"
                    >
                      {r.email}
                      {r.budget && r.budget !== "unspecified"
                        ? ` · ${r.budget.replace(/_/g, " ")}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {ago(r.created_at)}
                    </span>
                    <OpenLink href={`/admin/rfqs#${r.id}`} label={copy.openLabel} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          {recent.messages.length === 0 ? (
            <Empty text={copy.empty} />
          ) : (
            <ul className="divide-y divide-border">
              {recent.messages.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{m.full_name}</p>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.subject || m.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {ago(m.created_at)}
                    </span>
                    <OpenLink
                      href={`/admin/messages#${m.id}`}
                      label={copy.openLabel}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="jobApps" className="mt-4">
          {recent.jobApps.length === 0 ? (
            <Empty text={copy.empty} />
          ) : (
            <ul className="divide-y divide-border">
              {recent.jobApps.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{a.full_name}</p>
                      <StatusBadge status={a.status} />
                    </div>
                    <p
                      className="truncate text-xs text-muted-foreground"
                      dir="ltr"
                    >
                      {a.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {ago(a.created_at)}
                    </span>
                    <OpenLink
                      href={`/admin/job-applications#${a.id}`}
                      label={copy.openLabel}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="contractors" className="mt-4">
          {recent.contractors.length === 0 ? (
            <Empty text={copy.empty} />
          ) : (
            <ul className="divide-y divide-border">
              {recent.contractors.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{c.company_name}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p
                      className="truncate text-xs text-muted-foreground"
                      dir="ltr"
                    >
                      {c.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {ago(c.created_at)}
                    </span>
                    <OpenLink
                      href={`/admin/contractors#${c.id}`}
                      label={copy.openLabel}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function OpenLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs font-medium text-brand-navy hover:text-brand-gold dark:text-brand-cream"
    >
      {label}
      <IconArrowRight className="size-3 rtl:rotate-180" />
    </Link>
  );
}
