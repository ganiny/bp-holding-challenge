"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRIMARY_NAV = [
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "portfolio", href: "/portfolio" },
  { key: "studio", href: "/portfolio-studio" },
  { key: "certifications", href: "/certifications" },
  { key: "careers", href: "/careers" },
  { key: "contractors", href: "/contractors" },
  { key: "contact", href: "/contact" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo size={56} />

        <nav className="hidden min-[1025px]:flex items-center gap-1 ms-6">
          {PRIMARY_NAV.map((item) => {
            const active = pathname === item.href || (pathname.startsWith(item.href) && !pathname.includes('studio')) ;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors rounded-md",
                  active
                    ? "text-brand-navy dark:text-brand-gold after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-brand-gold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/rfq">{t("rfq")}</Link>
          </Button>
          <Link
            href="/login"
            className="hidden lg:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("login")}
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
