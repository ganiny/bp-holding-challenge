import { setRequestLocale, getTranslations } from "next-intl/server";
import { format, subDays, startOfDay } from "date-fns";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardCounters } from "@/components/admin/DashboardCounters";
import { DashboardTrends } from "@/components/admin/DashboardTrends";
import { DashboardRecent } from "@/components/admin/DashboardRecent";

const TREND_DAYS = 30;
const RECENT_LIMIT = 8;

type CountedRow = { count: number | null };

async function loadDashboard() {
  const supabase = await createSupabaseServerClient();
  const since = startOfDay(subDays(new Date(), TREND_DAYS - 1)).toISOString();

  const [
    rfqsNew,
    appsPending,
    contractorsPending,
    messagesUnread,
    projectsActive,
    careersOpen,
    rfqDates,
    messageDates,
    jobAppDates,
    contractorDates,
    recentRfqs,
    recentMessages,
    recentJobApps,
    recentContractors,
  ] = await Promise.all([
    supabase.from("rfqs").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase
      .from("job_applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["new", "reviewing"]),
    supabase
      .from("contractor_applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["new", "reviewing"]),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("careers")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase.from("rfqs").select("created_at").gte("created_at", since),
    supabase.from("contact_messages").select("created_at").gte("created_at", since),
    supabase.from("job_applications").select("created_at").gte("created_at", since),
    supabase.from("contractor_applications").select("created_at").gte("created_at", since),
    supabase
      .from("rfqs")
      .select("id, full_name, email, status, budget, created_at")
      .order("created_at", { ascending: false })
      .limit(RECENT_LIMIT),
    supabase
      .from("contact_messages")
      .select("id, full_name, email, subject, status, created_at")
      .order("created_at", { ascending: false })
      .limit(RECENT_LIMIT),
    supabase
      .from("job_applications")
      .select("id, full_name, email, status, created_at")
      .order("created_at", { ascending: false })
      .limit(RECENT_LIMIT),
    supabase
      .from("contractor_applications")
      .select("id, company_name, email, status, created_at")
      .order("created_at", { ascending: false })
      .limit(RECENT_LIMIT),
  ]);

  const series = buildDailySeries(
    [
      { key: "rfqs", rows: (rfqDates.data ?? []) as { created_at: string }[] },
      { key: "messages", rows: (messageDates.data ?? []) as { created_at: string }[] },
      { key: "jobApplications", rows: (jobAppDates.data ?? []) as { created_at: string }[] },
      { key: "contractors", rows: (contractorDates.data ?? []) as { created_at: string }[] },
    ],
    TREND_DAYS,
  );

  return {
    counters: {
      rfqsNew: (rfqsNew as unknown as CountedRow).count ?? 0,
      appsPending: (appsPending as unknown as CountedRow).count ?? 0,
      contractorsPending: (contractorsPending as unknown as CountedRow).count ?? 0,
      messagesUnread: (messagesUnread as unknown as CountedRow).count ?? 0,
      projectsActive: (projectsActive as unknown as CountedRow).count ?? 0,
      careersOpen: (careersOpen as unknown as CountedRow).count ?? 0,
    },
    series,
    recent: {
      rfqs: (recentRfqs.data ?? []) as RecentRfq[],
      messages: (recentMessages.data ?? []) as RecentMessage[],
      jobApps: (recentJobApps.data ?? []) as RecentJobApp[],
      contractors: (recentContractors.data ?? []) as RecentContractor[],
    },
  };
}

export type RecentRfq = {
  id: string;
  full_name: string;
  email: string;
  status: string;
  budget: string | null;
  created_at: string;
};
export type RecentMessage = {
  id: string;
  full_name: string;
  email: string;
  subject: string | null;
  status: string;
  created_at: string;
};
export type RecentJobApp = {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
};
export type RecentContractor = {
  id: string;
  company_name: string;
  email: string;
  status: string;
  created_at: string;
};

export type TrendKey = "rfqs" | "messages" | "jobApplications" | "contractors";
export type TrendPoint = {
  date: string;
  rfqs: number;
  messages: number;
  jobApplications: number;
  contractors: number;
};

function buildDailySeries(
  buckets: { key: TrendKey; rows: { created_at: string }[] }[],
  days: number,
): TrendPoint[] {
  const today = startOfDay(new Date());
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(format(subDays(today, i), "yyyy-MM-dd"));
  }
  const indexByDate = new Map(dates.map((d, i) => [d, i]));
  const series: TrendPoint[] = dates.map((date) => ({
    date,
    rfqs: 0,
    messages: 0,
    jobApplications: 0,
    contractors: 0,
  }));
  for (const bucket of buckets) {
    for (const row of bucket.rows) {
      const day = format(new Date(row.created_at), "yyyy-MM-dd");
      const idx = indexByDate.get(day);
      if (idx === undefined) continue;
      series[idx][bucket.key] += 1;
    }
  }
  return series;
}

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.overview");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const data = await loadDashboard();

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("lead")}</p>
      </header>

      <DashboardCounters
        counters={data.counters}
        copy={{
          rfqsNew: t("counters.rfqsNew"),
          rfqsNewDesc: t("counters.rfqsNewDesc"),
          appsPending: t("counters.appsPending"),
          appsPendingDesc: t("counters.appsPendingDesc"),
          contractorsPending: t("counters.contractorsPending"),
          contractorsPendingDesc: t("counters.contractorsPendingDesc"),
          messagesUnread: t("counters.messagesUnread"),
          messagesUnreadDesc: t("counters.messagesUnreadDesc"),
          projectsActive: t("counters.projectsActive"),
          projectsActiveDesc: t("counters.projectsActiveDesc"),
          careersOpen: t("counters.careersOpen"),
          careersOpenDesc: t("counters.careersOpenDesc"),
          openCta: t("counters.openCta"),
        }}
        locale={localeTyped}
      />

      <DashboardTrends
        data={data.series}
        days={TREND_DAYS}
        locale={localeTyped}
        copy={{
          title: t("trends.title"),
          subtitle: t("trends.subtitle"),
          rfqs: t("trends.rfqs"),
          messages: t("trends.messages"),
          jobApplications: t("trends.jobApplications"),
          contractors: t("trends.contractors"),
          empty: t("trends.empty"),
        }}
      />

      <DashboardRecent
        recent={data.recent}
        locale={localeTyped}
        copy={{
          title: t("recent.title"),
          subtitle: t("recent.subtitle"),
          tabRfqs: t("recent.tabRfqs"),
          tabMessages: t("recent.tabMessages"),
          tabJobApps: t("recent.tabJobApps"),
          tabContractors: t("recent.tabContractors"),
          empty: t("recent.empty"),
          openLabel: t("recent.openLabel"),
        }}
      />
    </section>
  );
}
