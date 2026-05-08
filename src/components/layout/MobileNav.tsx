"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "portfolio", href: "/portfolio" },
  { key: "studio", href: "/portfolio-studio" },
  { key: "store", href: "/store" },
  { key: "certifications", href: "/certifications" },
  { key: "careers", href: "/careers" },
  { key: "contractors", href: "/contractors" },
  { key: "contact", href: "/contact" },
] as const;

export function MobileNav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Slide in from the inline-end edge of the viewport: right in LTR, left in RTL.
  const side = locale === "ar" ? "left" : "right";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("menu")} className=" min-[1025px]:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="w-[88vw] max-w-sm flex flex-col gap-0 p-0">
        <SheetHeader className="border-b p-4 shrink-0">
          <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
          <Logo size={56} />
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <nav className="flex flex-col gap-1 p-4">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-3 text-sm transition-colors",
                    active
                      ? "bg-brand-navy text-brand-cream"
                      : "hover:bg-secondary",
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          <Separator />

          <div className="flex flex-col gap-3 p-4">
            <Button asChild className="w-full">
              <Link href="/rfq" onClick={() => setOpen(false)}>
                {t("rfq")}
              </Link>
            </Button>
            <div className="flex items-center justify-between">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login" onClick={() => setOpen(false)}>
                  {t("login")}
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <LocaleSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
