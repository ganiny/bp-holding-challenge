"use client";

import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { Link, usePathname } from "@/lib/i18n/navigation";
import {
  IconLayoutDashboard,
  IconBriefcase,
  IconPhotoVideo,
  IconUserSearch,
  IconFileDescription,
  IconBuildingFactory2,
  IconClipboardList,
  IconMessageDots,
  IconCertificate,
  IconAdjustments,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
  IconMenu2,
  IconLoader2,
  IconUserCircle,
  IconShoppingBag,
  IconReceipt2,
} from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { ImageKitImage } from "../imagekit/ImageKitImage";

const COLLAPSED_KEY = "bp-admin-sidebar-collapsed";
const COLLAPSED_EVENT = "bp-admin-sidebar-collapsed-change";

function subscribeCollapsed(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(COLLAPSED_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(COLLAPSED_EVENT, cb);
  };
}
function getCollapsedSnapshot() {
  return window.localStorage.getItem(COLLAPSED_KEY) === "1";
}
function getCollapsedServerSnapshot() {
  return false;
}

export type AdminShellCopy = {
  brand: string;
  sectionMain: string;
  sectionContent: string;
  sectionSettings: string;
  roleAdmin: string;
  signOut: string;
  signingOut: string;
  collapse: string;
  expand: string;
  openMenu: string;
  closeMenu: string;
  navOverview: string;
  navProjects: string;
  navStudio: string;
  navCareers: string;
  navJobApplications: string;
  navContractors: string;
  navRfqs: string;
  navMessages: string;
  navCertifications: string;
  navContent: string;
  navSettings: string;
  navProducts: string;
  navOrders: string;
  sectionStore: string;
  breadcrumbAdmin: string;
};

type Section = {
  key: "main" | "store" | "content" | "settings";
  items: {
    href: string;
    key: string;
    label: string;
    Icon: typeof IconLayoutDashboard;
  }[];
};

function buildSections(copy: AdminShellCopy): Section[] {
  return [
    {
      key: "main",
      items: [
        {
          href: "/admin",
          key: "overview",
          label: copy.navOverview,
          Icon: IconLayoutDashboard,
        },
        {
          href: "/admin/projects",
          key: "projects",
          label: copy.navProjects,
          Icon: IconBriefcase,
        },
        {
          href: "/admin/portfolio-studio",
          key: "studio",
          label: copy.navStudio,
          Icon: IconPhotoVideo,
        },
      ],
    },
    {
      key: "store",
      items: [
        {
          href: "/admin/products",
          key: "products",
          label: copy.navProducts,
          Icon: IconShoppingBag,
        },
        {
          href: "/admin/orders",
          key: "orders",
          label: copy.navOrders,
          Icon: IconReceipt2,
        },
      ],
    },
    {
      key: "content",
      items: [
        {
          href: "/admin/careers",
          key: "careers",
          label: copy.navCareers,
          Icon: IconBuildingFactory2,
        },
        {
          href: "/admin/job-applications",
          key: "jobApplications",
          label: copy.navJobApplications,
          Icon: IconUserSearch,
        },
        {
          href: "/admin/contractors",
          key: "contractors",
          label: copy.navContractors,
          Icon: IconFileDescription,
        },
        {
          href: "/admin/rfqs",
          key: "rfqs",
          label: copy.navRfqs,
          Icon: IconClipboardList,
        },
        {
          href: "/admin/messages",
          key: "messages",
          label: copy.navMessages,
          Icon: IconMessageDots,
        },
        {
          href: "/admin/certifications",
          key: "certifications",
          label: copy.navCertifications,
          Icon: IconCertificate,
        },
        {
          href: "/admin/content",
          key: "content",
          label: copy.navContent,
          Icon: IconAdjustments,
        },
      ],
    },
    {
      key: "settings",
      items: [
        {
          href: "/admin/settings",
          key: "settings",
          label: copy.navSettings,
          Icon: IconSettings,
        },
      ],
    },
  ];
}

export function AdminShell({
  locale,
  profile,
  copy,
  children,
}: {
  locale: "ar" | "en";
  profile: {
    fullName: string | null;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
  copy: AdminShellCopy;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    try {
      const next = !(window.localStorage.getItem(COLLAPSED_KEY) === "1");
      window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      window.dispatchEvent(new Event(COLLAPSED_EVENT));
    } catch {}
  }, []);

  const sections = useMemo(() => buildSections(copy), [copy]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-svh w-full bg-muted/30">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 border-e border-border bg-card transition-[width] duration-200 ease-out",
          collapsed ? "w-18" : "w-64",
        )}
      >
        <SidebarContent
          locale={locale}
          collapsed={collapsed}
          sections={sections}
          pathname={pathname}
          profile={profile}
          copy={copy}
          onToggleCollapse={toggleCollapsed}
        />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label={copy.openMenu}
              >
                <IconMenu2 className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={locale === "ar" ? "right" : "left"}
              className="w-72 p-0"
            >
              <SheetTitle className="sr-only">{copy.brand}</SheetTitle>
              <SidebarContent
                locale={locale}
                collapsed={false}
                sections={sections}
                pathname={pathname}
                profile={profile}
                copy={copy}
                onNavigate={closeMobile}
              />
            </SheetContent>
          </Sheet>

          <Breadcrumbs pathname={pathname} sections={sections} copy={copy} />

          <div className="ms-auto flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  locale,
  collapsed,
  sections,
  pathname,
  profile,
  copy,
  onToggleCollapse,
  onNavigate,
}: {
  locale: "ar" | "en";
  collapsed: boolean;
  sections: Section[];
  pathname: string;
  profile: {
    fullName: string | null;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
  copy: AdminShellCopy;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border px-3 py-3",
          collapsed ? "justify-center" : "",
        )}
      >
        {collapsed ? (
          <Logo size={36} />
        ) : (
          <>
            <Logo size={36} />
            <div className="ms-2 flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[10px] font-mono uppercase tracking-[0.18em] text-brand-gold">
                {copy.brand}
              </span>
              <span className="truncate text-sm font-semibold">
                {copy.roleAdmin}
              </span>
            </div>
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section) => (
          <div key={section.key} className="mb-4 last:mb-0">
            {!collapsed ? (
              <p className="px-2 pb-1 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                {section.key === "main"
                  ? copy.sectionMain
                  : section.key === "store"
                    ? copy.sectionStore
                    : section.key === "content"
                      ? copy.sectionContent
                      : copy.sectionSettings}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                        active
                          ? "bg-brand-gold/10 text-brand-navy dark:text-brand-cream"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        collapsed ? "justify-center" : "",
                      )}
                    >
                      <item.Icon
                        className={cn(
                          "size-5 shrink-0",
                          active ? "text-brand-gold" : "",
                        )}
                      />
                      {!collapsed ? (
                        <span className="truncate">{item.label}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-2",
            collapsed ? "justify-center" : "",
          )}
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-navy/10 text-brand-navy">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <ImageKitImage
                src={profile.avatarUrl}
                alt="avatar"
                className="size-9 rounded-full object-cover"
                width={36}
                height={36}
              />
            ) : (
              <IconUserCircle className="size-6" />
            )}
          </span>
          {!collapsed ? (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium">
                {profile.fullName || profile.email.split("@")[0]}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {profile.email}
              </p>
            </div>
          ) : null}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await signOut(locale);
            })
          }
          className={cn(
            "mt-2 w-full justify-start gap-2",
            collapsed ? "justify-center" : "",
          )}
          title={collapsed ? copy.signOut : undefined}
        >
          {isPending ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconLogout className="size-4 rtl:rotate-180" />
          )}
          {!collapsed ? (isPending ? copy.signingOut : copy.signOut) : null}
        </Button>

        {onToggleCollapse ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="mt-2 w-full"
            title={collapsed ? copy.expand : copy.collapse}
            aria-label={collapsed ? copy.expand : copy.collapse}
          >
            {collapsed ? (
              <IconChevronRight className="size-4 rtl:rotate-180" />
            ) : (
              <IconChevronLeft className="size-4 rtl:rotate-180" />
            )}
            {!collapsed ? (
              <span className="text-xs">{copy.collapse}</span>
            ) : null}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function Breadcrumbs({
  pathname,
  sections,
  copy,
}: {
  pathname: string;
  sections: Section[];
  copy: AdminShellCopy;
}) {
  const segments = pathname.split("/").filter(Boolean);
  const adminIndex = segments.indexOf("admin");
  const trail = adminIndex >= 0 ? segments.slice(adminIndex) : segments;

  const labels = useMemo(() => {
    const map = new Map<string, string>();
    map.set("admin", copy.breadcrumbAdmin);
    for (const section of sections) {
      for (const item of section.items) {
        const lastSeg = item.href.split("/").filter(Boolean).pop();
        if (lastSeg) map.set(lastSeg, item.label);
      }
    }
    return map;
  }, [sections, copy.breadcrumbAdmin]);

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 sm:block">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {trail.map((seg, i) => {
          const isLast = i === trail.length - 1;
          const label = labels.get(seg) ?? seg;
          return (
            <li key={`${seg}-${i}`} className="flex items-center gap-1">
              {i > 0 ? (
                <IconChevronRight className="size-3.5 text-muted-foreground/60 rtl:rotate-180" />
              ) : null}
              <span
                className={cn(
                  "truncate",
                  isLast ? "font-medium text-foreground" : "",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
