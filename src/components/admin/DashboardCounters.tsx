import { Link } from "@/lib/i18n/navigation";
import {
  IconClipboardList,
  IconUserSearch,
  IconBuildingFactory2,
  IconMessageDots,
  IconBriefcase,
  IconFileDescription,
  IconArrowRight,
} from "@tabler/icons-react";

type Counters = {
  rfqsNew: number;
  appsPending: number;
  contractorsPending: number;
  messagesUnread: number;
  projectsActive: number;
  careersOpen: number;
};

type Copy = {
  rfqsNew: string;
  rfqsNewDesc: string;
  appsPending: string;
  appsPendingDesc: string;
  contractorsPending: string;
  contractorsPendingDesc: string;
  messagesUnread: string;
  messagesUnreadDesc: string;
  projectsActive: string;
  projectsActiveDesc: string;
  careersOpen: string;
  careersOpenDesc: string;
  openCta: string;
};

export function DashboardCounters({
  counters,
  copy,
  locale,
}: {
  counters: Counters;
  copy: Copy;
  locale: "ar" | "en";
}) {
  const fmt = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");
  const items: {
    key: keyof Counters;
    href: string;
    label: string;
    description: string;
    Icon: typeof IconClipboardList;
    accent: "gold" | "navy";
  }[] = [
    {
      key: "rfqsNew",
      href: "/admin/rfqs",
      label: copy.rfqsNew,
      description: copy.rfqsNewDesc,
      Icon: IconClipboardList,
      accent: "gold",
    },
    {
      key: "appsPending",
      href: "/admin/job-applications",
      label: copy.appsPending,
      description: copy.appsPendingDesc,
      Icon: IconUserSearch,
      accent: "navy",
    },
    {
      key: "contractorsPending",
      href: "/admin/contractors",
      label: copy.contractorsPending,
      description: copy.contractorsPendingDesc,
      Icon: IconFileDescription,
      accent: "navy",
    },
    {
      key: "messagesUnread",
      href: "/admin/messages",
      label: copy.messagesUnread,
      description: copy.messagesUnreadDesc,
      Icon: IconMessageDots,
      accent: "gold",
    },
    {
      key: "projectsActive",
      href: "/admin/projects",
      label: copy.projectsActive,
      description: copy.projectsActiveDesc,
      Icon: IconBriefcase,
      accent: "navy",
    },
    {
      key: "careersOpen",
      href: "/admin/careers",
      label: copy.careersOpen,
      description: copy.careersOpenDesc,
      Icon: IconBuildingFactory2,
      accent: "navy",
    },
  ];

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold/40 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-3xl font-semibold tabular-nums tracking-tight">
                  {fmt.format(counters[item.key])}
                </p>
              </div>
              <span
                className={
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-full " +
                  (item.accent === "gold"
                    ? "bg-brand-gold/15 text-brand-gold"
                    : "bg-brand-navy/10 text-brand-navy dark:bg-brand-cream/10 dark:text-brand-cream")
                }
              >
                <item.Icon className="size-5" />
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {item.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-navy transition-colors group-hover:text-brand-gold dark:text-brand-cream">
              {copy.openCta}
              <IconArrowRight className="size-3.5 rtl:rotate-180" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
