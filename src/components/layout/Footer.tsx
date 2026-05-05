import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Logo } from "./Logo";
import { Mail, Phone, MapPin } from "lucide-react";
import { IconBrandLinkedin, IconBrandFacebook } from "@tabler/icons-react";

const EXPLORE = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "portfolio", href: "/portfolio" },
  { key: "studio", href: "/portfolio-studio" },
  { key: "certifications", href: "/certifications" },
] as const;

const WORK_WITH_US = [
  { key: "careers", href: "/careers" },
  { key: "contractors", href: "/contractors" },
  { key: "rfq", href: "/rfq" },
  { key: "contact", href: "/contact" },
] as const;

const LEGAL: { key: "privacy" | "terms" | "companyProfile"; href: string; source: "footer" | "nav" }[] = [
  { key: "privacy", href: "/privacy", source: "footer" },
  { key: "terms", href: "/terms", source: "footer" },
  { key: "companyProfile", href: "/company-profile", source: "nav" },
];

export function Footer() {
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const tCommon = useTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <Logo size={72} />
            <p className="text-sm text-muted-foreground max-w-sm">
              {tCommon("tagline")}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-brand-gold" />
                {tFooter("address")}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-brand-gold" />
                {tFooter("addressJeddah")}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-brand-gold" />
                <a href="mailto:info@BPholding.net" className="hover:text-foreground transition-colors">
                  info@BPholding.net
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-brand-gold" />
                <a href="tel:+966545086220" className="hover:text-foreground transition-colors" dir="ltr">
                  +966 54 50 86 220
                </a>
              </p>
            </div>
          </div>

          <FooterColumn title={tFooter("exploreTitle")} items={EXPLORE.map((i) => ({ key: i.key, href: i.href, label: tNav(i.key) }))} className="lg:col-span-2" />
          <FooterColumn title={tFooter("workWithUsTitle")} items={WORK_WITH_US.map((i) => ({ key: i.key, href: i.href, label: tNav(i.key) }))} className="lg:col-span-2" />
          <FooterColumn
            title={tFooter("legalTitle")}
            items={LEGAL.map((i) => ({
              key: i.key,
              href: i.href,
              label: i.source === "footer" ? tFooter(i.key as "privacy" | "terms") : tNav(i.key as "companyProfile"),
            }))}
            className="lg:col-span-2"
          />

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {tFooter("social")}
            </h3>
            <div className="flex items-center gap-2">
              <SocialIcon
                href="https://www.linkedin.com/company/business-pioneers-holding/"
                label="LinkedIn"
                icon={<IconBrandLinkedin className="size-4" />}
              />
              <SocialIcon
                href="https://www.facebook.com/p/Business-Pioneers-Holding-PB-61584852089418/"
                label="Facebook"
                icon={<IconBrandFacebook className="size-4" />}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>{tFooter("rights", { year })}</p>
          <p className="font-mono text-[11px]">{tCommon("siteFullName")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
  className,
}: {
  title: string;
  items: { key: string; href: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
        {title}
      </h3>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="text-foreground/80 hover:text-foreground hover:underline underline-offset-4 decoration-brand-gold transition-colors">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-brand-gold hover:border-brand-gold transition-colors"
    >
      {icon}
    </a>
  );
}
