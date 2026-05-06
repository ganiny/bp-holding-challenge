import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ContentAdminClient,
  type SiteContentSnapshot,
} from "@/components/admin/ContentAdminClient";
import {
  siteContentDefaults,
  type SiteContentKey,
  type HomeHero,
  type HomeCta,
  type AboutTimeline,
  type Footer,
  type Contact,
} from "@/lib/validation/siteContent";

const KEYS: SiteContentKey[] = [
  "home.hero",
  "home.cta",
  "about.timeline",
  "footer",
  "contact",
];

export default async function AdminContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.contentAdmin");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("site_content")
    .select("key, data, updated_at")
    .in("key", KEYS);

  type Row = { key: SiteContentKey; data: unknown; updated_at: string };
  const byKey = new Map<SiteContentKey, Row>();
  for (const r of (rows ?? []) as Row[]) byKey.set(r.key, r);

  const snapshot: SiteContentSnapshot = {
    "home.hero": {
      data: (byKey.get("home.hero")?.data as HomeHero | undefined) ??
        siteContentDefaults["home.hero"],
      updated_at: byKey.get("home.hero")?.updated_at ?? null,
    },
    "home.cta": {
      data: (byKey.get("home.cta")?.data as HomeCta | undefined) ??
        siteContentDefaults["home.cta"],
      updated_at: byKey.get("home.cta")?.updated_at ?? null,
    },
    "about.timeline": {
      data:
        (byKey.get("about.timeline")?.data as AboutTimeline | undefined) ??
        siteContentDefaults["about.timeline"],
      updated_at: byKey.get("about.timeline")?.updated_at ?? null,
    },
    footer: {
      data: (byKey.get("footer")?.data as Footer | undefined) ??
        siteContentDefaults.footer,
      updated_at: byKey.get("footer")?.updated_at ?? null,
    },
    contact: {
      data: (byKey.get("contact")?.data as Contact | undefined) ??
        siteContentDefaults.contact,
      updated_at: byKey.get("contact")?.updated_at ?? null,
    },
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("lead")}</p>
        </div>
      </header>

      <ContentAdminClient
        locale={localeTyped}
        snapshot={snapshot}
        copy={{
          tabHero: t("tabs.hero"),
          tabCta: t("tabs.cta"),
          tabTimeline: t("tabs.timeline"),
          tabFooter: t("tabs.footer"),
          tabContact: t("tabs.contact"),
          lastSavedNever: t("lastSavedNever"),
          lastSavedPrefix: t("lastSavedPrefix"),
          save: t("save"),
          saving: t("saving"),
          successSaved: t("toast.saved"),
          errorValidation: t("errors.validation"),
          errorUnauthorized: t("errors.unauthorized"),
          errorGeneric: t("errors.generic"),
          // hero
          heroEyebrowEn: t("hero.eyebrowEn"),
          heroEyebrowAr: t("hero.eyebrowAr"),
          heroTitleEn: t("hero.titleEn"),
          heroTitleAr: t("hero.titleAr"),
          heroSubtitleEn: t("hero.subtitleEn"),
          heroSubtitleAr: t("hero.subtitleAr"),
          heroCtaPrimaryEn: t("hero.ctaPrimaryEn"),
          heroCtaPrimaryAr: t("hero.ctaPrimaryAr"),
          heroCtaPrimaryHref: t("hero.ctaPrimaryHref"),
          heroCtaSecondaryEn: t("hero.ctaSecondaryEn"),
          heroCtaSecondaryAr: t("hero.ctaSecondaryAr"),
          heroCtaSecondaryHref: t("hero.ctaSecondaryHref"),
          heroSliderTitle: t("hero.sliderTitle"),
          heroSliderHint: t("hero.sliderHint"),
          heroSliderAdd: t("hero.sliderAdd"),
          heroSliderRemove: t("hero.sliderRemove"),
          heroSliderAltEn: t("hero.sliderAltEn"),
          heroSliderAltAr: t("hero.sliderAltAr"),
          heroSliderEmpty: t("hero.sliderEmpty"),
          // cta
          ctaTitleEn: t("cta.titleEn"),
          ctaTitleAr: t("cta.titleAr"),
          ctaSubtitleEn: t("cta.subtitleEn"),
          ctaSubtitleAr: t("cta.subtitleAr"),
          ctaButtonEn: t("cta.buttonEn"),
          ctaButtonAr: t("cta.buttonAr"),
          ctaButtonHref: t("cta.buttonHref"),
          // timeline
          timelineSubtitle: t("timeline.subtitle"),
          timelineAdd: t("timeline.add"),
          timelineRemove: t("timeline.remove"),
          timelineEmpty: t("timeline.empty"),
          timelineYear: t("timeline.year"),
          timelineHeadingEn: t("timeline.headingEn"),
          timelineHeadingAr: t("timeline.headingAr"),
          timelineBodyEn: t("timeline.bodyEn"),
          timelineBodyAr: t("timeline.bodyAr"),
          // footer
          footerTaglineEn: t("footer.taglineEn"),
          footerTaglineAr: t("footer.taglineAr"),
          footerSocialsTitle: t("footer.socialsTitle"),
          footerLinkedin: t("footer.linkedin"),
          footerTwitter: t("footer.twitter"),
          footerFacebook: t("footer.facebook"),
          footerInstagram: t("footer.instagram"),
          footerYoutube: t("footer.youtube"),
          // contact
          contactHqAddressEn: t("contact.hqAddressEn"),
          contactHqAddressAr: t("contact.hqAddressAr"),
          contactHqPhone: t("contact.hqPhone"),
          contactBranchAddressEn: t("contact.branchAddressEn"),
          contactBranchAddressAr: t("contact.branchAddressAr"),
          contactBranchPhone: t("contact.branchPhone"),
          contactEmail: t("contact.email"),
          contactHoursEn: t("contact.hoursEn"),
          contactHoursAr: t("contact.hoursAr"),
        }}
      />
    </section>
  );
}
