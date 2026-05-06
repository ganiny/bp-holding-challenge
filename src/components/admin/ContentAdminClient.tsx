"use client";

import { useTransition } from "react";
import {
  useForm,
  useFieldArray,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format as formatDate, parseISO } from "date-fns";
import { ar as arLocale, enUS as enLocale } from "date-fns/locale";
import {
  IconLoader2,
  IconPlus,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ImageKitUploader,
  type UploadResult,
} from "@/components/imagekit/ImageKitUploader";
import {
  homeHeroSchema,
  homeCtaSchema,
  aboutTimelineSchema,
  footerSchema,
  contactSchema,
  type HomeHero,
  type HomeCta,
  type AboutTimeline,
  type Footer,
  type Contact,
  type SiteContentKey,
} from "@/lib/validation/siteContent";
import { saveSiteContent } from "@/app/[locale]/admin/content/actions";
import { Image, ImageKitProvider } from "@imagekit/next";

export type SiteContentSnapshot = {
  "home.hero": { data: HomeHero; updated_at: string | null };
  "home.cta": { data: HomeCta; updated_at: string | null };
  "about.timeline": { data: AboutTimeline; updated_at: string | null };
  footer: { data: Footer; updated_at: string | null };
  contact: { data: Contact; updated_at: string | null };
};

export type ContentAdminCopy = {
  tabHero: string;
  tabCta: string;
  tabTimeline: string;
  tabFooter: string;
  tabContact: string;
  lastSavedNever: string;
  lastSavedPrefix: string;
  save: string;
  saving: string;
  successSaved: string;
  errorValidation: string;
  errorUnauthorized: string;
  errorGeneric: string;
  // hero
  heroEyebrowEn: string;
  heroEyebrowAr: string;
  heroTitleEn: string;
  heroTitleAr: string;
  heroSubtitleEn: string;
  heroSubtitleAr: string;
  heroCtaPrimaryEn: string;
  heroCtaPrimaryAr: string;
  heroCtaPrimaryHref: string;
  heroCtaSecondaryEn: string;
  heroCtaSecondaryAr: string;
  heroCtaSecondaryHref: string;
  heroSliderTitle: string;
  heroSliderHint: string;
  heroSliderAdd: string;
  heroSliderRemove: string;
  heroSliderAltEn: string;
  heroSliderAltAr: string;
  heroSliderEmpty: string;
  // cta
  ctaTitleEn: string;
  ctaTitleAr: string;
  ctaSubtitleEn: string;
  ctaSubtitleAr: string;
  ctaButtonEn: string;
  ctaButtonAr: string;
  ctaButtonHref: string;
  // timeline
  timelineSubtitle: string;
  timelineAdd: string;
  timelineRemove: string;
  timelineEmpty: string;
  timelineYear: string;
  timelineHeadingEn: string;
  timelineHeadingAr: string;
  timelineBodyEn: string;
  timelineBodyAr: string;
  // footer
  footerTaglineEn: string;
  footerTaglineAr: string;
  footerSocialsTitle: string;
  footerLinkedin: string;
  footerTwitter: string;
  footerFacebook: string;
  footerInstagram: string;
  footerYoutube: string;
  // contact
  contactHqAddressEn: string;
  contactHqAddressAr: string;
  contactHqPhone: string;
  contactBranchAddressEn: string;
  contactBranchAddressAr: string;
  contactBranchPhone: string;
  contactEmail: string;
  contactHoursEn: string;
  contactHoursAr: string;
};

function LastSaved({
  iso,
  locale,
  copy,
}: {
  iso: string | null;
  locale: "ar" | "en";
  copy: ContentAdminCopy;
}) {
  if (!iso) {
    return (
      <span className="text-xs text-muted-foreground">
        {copy.lastSavedNever}
      </span>
    );
  }
  let formatted = iso;
  try {
    formatted = formatDate(parseISO(iso), "PPpp", {
      locale: locale === "ar" ? arLocale : enLocale,
    });
  } catch {
    /* fall through to raw iso */
  }
  return (
    <span className="text-xs text-muted-foreground">
      {copy.lastSavedPrefix} {formatted}
    </span>
  );
}

export function ContentAdminClient({
  snapshot,
  locale,
  copy,
}: {
  snapshot: SiteContentSnapshot;
  locale: "ar" | "en";
  copy: ContentAdminCopy;
}) {
  return (
    <Tabs defaultValue="hero">
      <TabsList className="flex flex-wrap gap-1 bg-muted/50">
        <TabsTrigger value="hero">{copy.tabHero}</TabsTrigger>
        <TabsTrigger value="cta">{copy.tabCta}</TabsTrigger>
        <TabsTrigger value="timeline">{copy.tabTimeline}</TabsTrigger>
        <TabsTrigger value="footer">{copy.tabFooter}</TabsTrigger>
        <TabsTrigger value="contact">{copy.tabContact}</TabsTrigger>
      </TabsList>

      <TabsContent value="hero" className="mt-6">
        <HeroForm
          initial={snapshot["home.hero"].data}
          updatedAt={snapshot["home.hero"].updated_at}
          locale={locale}
          copy={copy}
        />
      </TabsContent>
      <TabsContent value="cta" className="mt-6">
        <CtaForm
          initial={snapshot["home.cta"].data}
          updatedAt={snapshot["home.cta"].updated_at}
          locale={locale}
          copy={copy}
        />
      </TabsContent>
      <TabsContent value="timeline" className="mt-6">
        <TimelineForm
          initial={snapshot["about.timeline"].data}
          updatedAt={snapshot["about.timeline"].updated_at}
          locale={locale}
          copy={copy}
        />
      </TabsContent>
      <TabsContent value="footer" className="mt-6">
        <FooterForm
          initial={snapshot.footer.data}
          updatedAt={snapshot.footer.updated_at}
          locale={locale}
          copy={copy}
        />
      </TabsContent>
      <TabsContent value="contact" className="mt-6">
        <ContactForm
          initial={snapshot.contact.data}
          updatedAt={snapshot.contact.updated_at}
          locale={locale}
          copy={copy}
        />
      </TabsContent>
    </Tabs>
  );
}

function useSave<T>(
  key: SiteContentKey,
  locale: "ar" | "en",
  copy: ContentAdminCopy,
) {
  const [isPending, startTransition] = useTransition();
  function save(data: T, onDone?: () => void) {
    startTransition(async () => {
      const res = await saveSiteContent({ key, data }, locale);
      if (res.ok) {
        toast.success(copy.successSaved);
        onDone?.();
      } else if (res.code === "validation") {
        toast.error(copy.errorValidation);
      } else if (res.code === "unauthorized") {
        toast.error(copy.errorUnauthorized);
      } else {
        toast.error(copy.errorGeneric);
      }
    });
  }
  return { save, isPending };
}

function FormFooter({
  isPending,
  updatedAt,
  locale,
  copy,
}: {
  isPending: boolean;
  updatedAt: string | null;
  locale: "ar" | "en";
  copy: ContentAdminCopy;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
      <LastSaved iso={updatedAt} locale={locale} copy={copy} />
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <IconLoader2 className="size-4 animate-spin" />
            {copy.saving}
          </>
        ) : (
          copy.save
        )}
      </Button>
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────

function HeroForm({
  initial,
  updatedAt,
  locale,
  copy,
}: {
  initial: HomeHero;
  updatedAt: string | null;
  locale: "ar" | "en";
  copy: ContentAdminCopy;
}) {
  const { save, isPending } = useSave<HomeHero>("home.hero", locale, copy);
  const { register, handleSubmit, control } = useForm<HomeHero>({
    resolver: (zodResolver as unknown as (s: unknown) => Resolver<HomeHero>)(
      homeHeroSchema,
    ),
    defaultValues: initial,
  });
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "slider_images",
  });

  const onSubmit: SubmitHandler<HomeHero> = (data) => save(data);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-xl border border-border bg-card p-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{copy.heroEyebrowEn}</Label>
          <Input dir="ltr" {...register("eyebrow_en")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.heroEyebrowAr}</Label>
          <Input dir="rtl" {...register("eyebrow_ar")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.heroTitleEn}</Label>
          <Input dir="ltr" {...register("title_en")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.heroTitleAr}</Label>
          <Input dir="rtl" {...register("title_ar")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.heroSubtitleEn}</Label>
          <Textarea dir="ltr" rows={3} {...register("subtitle_en")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.heroSubtitleAr}</Label>
          <Textarea dir="rtl" rows={3} {...register("subtitle_ar")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.heroCtaPrimaryEn}</Label>
          <Input dir="ltr" {...register("cta_primary_label_en")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.heroCtaPrimaryAr}</Label>
          <Input dir="rtl" {...register("cta_primary_label_ar")} className="mt-2" />
        </div>
        <div className="sm:col-span-2">
          <Label>{copy.heroCtaPrimaryHref}</Label>
          <Input
            dir="ltr"
            placeholder="/rfq"
            {...register("cta_primary_href")}
            className="mt-2"
          />
        </div>
        <div>
          <Label>{copy.heroCtaSecondaryEn}</Label>
          <Input dir="ltr" {...register("cta_secondary_label_en")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.heroCtaSecondaryAr}</Label>
          <Input dir="rtl" {...register("cta_secondary_label_ar")} className="mt-2" />
        </div>
        <div className="sm:col-span-2">
          <Label>{copy.heroCtaSecondaryHref}</Label>
          <Input
            dir="ltr"
            placeholder="/portfolio"
            {...register("cta_secondary_href")}
            className="mt-2"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            {copy.heroSliderTitle}
          </h3>
          <p className="text-xs text-muted-foreground">{copy.heroSliderHint}</p>
        </div>

        {fields.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            {copy.heroSliderEmpty}
          </p>
        ) : (
          <ul className="space-y-2">
            {fields.map((g, idx) => (
              <li
                key={g.id}
                className="flex flex-wrap items-start gap-3 rounded-lg border border-border bg-muted/30 p-2"
              >
                <div className="relative size-20 overflow-hidden rounded-md bg-muted shrink-0">
                  <ImageKitProvider
                    urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                  >
                    <Image
                      src={g.file_path}
                      fill
                      sizes="80px"
                      className="object-cover"
                      alt="cover image"
                    />
                  </ImageKitProvider>
                </div>
                <div className="grid flex-1 min-w-[200px] gap-2 sm:grid-cols-2">
                  <Input
                    dir="ltr"
                    placeholder={copy.heroSliderAltEn}
                    {...register(`slider_images.${idx}.alt_en` as const)}
                  />
                  <Input
                    dir="rtl"
                    placeholder={copy.heroSliderAltAr}
                    {...register(`slider_images.${idx}.alt_ar` as const)}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === 0}
                    onClick={() => move(idx, idx - 1)}
                  >
                    <IconArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === fields.length - 1}
                    onClick={() => move(idx, idx + 1)}
                  >
                    <IconArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(idx)}
                    title={copy.heroSliderRemove}
                  >
                    <IconTrash className="size-4 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <ImageKitUploader
          folder="/public/projects"
          accept="image/*"
          multiple
          maxSizeMB={20}
          label={copy.heroSliderAdd}
          onUploaded={(results: UploadResult[]) => {
            for (const r of results) {
              append({ file_path: r.filePath, alt_en: null, alt_ar: null });
            }
          }}
        />
      </div>

      <FormFooter
        isPending={isPending}
        updatedAt={updatedAt}
        locale={locale}
        copy={copy}
      />
    </form>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────

function CtaForm({
  initial,
  updatedAt,
  locale,
  copy,
}: {
  initial: HomeCta;
  updatedAt: string | null;
  locale: "ar" | "en";
  copy: ContentAdminCopy;
}) {
  const { save, isPending } = useSave<HomeCta>("home.cta", locale, copy);
  const { register, handleSubmit } = useForm<HomeCta>({
    resolver: (zodResolver as unknown as (s: unknown) => Resolver<HomeCta>)(
      homeCtaSchema,
    ),
    defaultValues: initial,
  });

  const onSubmit: SubmitHandler<HomeCta> = (data) => save(data);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-xl border border-border bg-card p-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{copy.ctaTitleEn}</Label>
          <Input dir="ltr" {...register("title_en")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.ctaTitleAr}</Label>
          <Input dir="rtl" {...register("title_ar")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.ctaSubtitleEn}</Label>
          <Textarea dir="ltr" rows={3} {...register("subtitle_en")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.ctaSubtitleAr}</Label>
          <Textarea dir="rtl" rows={3} {...register("subtitle_ar")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.ctaButtonEn}</Label>
          <Input dir="ltr" {...register("button_label_en")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.ctaButtonAr}</Label>
          <Input dir="rtl" {...register("button_label_ar")} className="mt-2" />
        </div>
        <div className="sm:col-span-2">
          <Label>{copy.ctaButtonHref}</Label>
          <Input dir="ltr" placeholder="/rfq" {...register("button_href")} className="mt-2" />
        </div>
      </div>

      <FormFooter
        isPending={isPending}
        updatedAt={updatedAt}
        locale={locale}
        copy={copy}
      />
    </form>
  );
}

// ── Timeline ───────────────────────────────────────────────────────────────

function TimelineForm({
  initial,
  updatedAt,
  locale,
  copy,
}: {
  initial: AboutTimeline;
  updatedAt: string | null;
  locale: "ar" | "en";
  copy: ContentAdminCopy;
}) {
  const { save, isPending } = useSave<AboutTimeline>(
    "about.timeline",
    locale,
    copy,
  );
  const { register, handleSubmit, control } = useForm<AboutTimeline>({
    resolver: (
      zodResolver as unknown as (s: unknown) => Resolver<AboutTimeline>
    )(aboutTimelineSchema),
    defaultValues: initial,
  });
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "entries",
  });

  const onSubmit: SubmitHandler<AboutTimeline> = (data) => save(data);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-xl border border-border bg-card p-5"
      noValidate
    >
      <p className="text-xs text-muted-foreground">{copy.timelineSubtitle}</p>

      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          {copy.timelineEmpty}
        </p>
      ) : (
        <ul className="space-y-3">
          {fields.map((entry, idx) => (
            <li
              key={entry.id}
              className="rounded-lg border border-border bg-muted/30 p-3 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === 0}
                    onClick={() => move(idx, idx - 1)}
                  >
                    <IconArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={idx === fields.length - 1}
                    onClick={() => move(idx, idx + 1)}
                  >
                    <IconArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(idx)}
                    title={copy.timelineRemove}
                  >
                    <IconTrash className="size-4 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>{copy.timelineYear}</Label>
                  <Input
                    dir="ltr"
                    placeholder="2026"
                    {...register(`entries.${idx}.year` as const)}
                    className="mt-2"
                  />
                </div>
                <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>{copy.timelineHeadingEn}</Label>
                    <Input
                      dir="ltr"
                      {...register(`entries.${idx}.heading_en` as const)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>{copy.timelineHeadingAr}</Label>
                    <Input
                      dir="rtl"
                      {...register(`entries.${idx}.heading_ar` as const)}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label>{copy.timelineBodyEn}</Label>
                  <Textarea
                    dir="ltr"
                    rows={3}
                    {...register(`entries.${idx}.body_en` as const)}
                    className="mt-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{copy.timelineBodyAr}</Label>
                  <Textarea
                    dir="rtl"
                    rows={3}
                    {...register(`entries.${idx}.body_ar` as const)}
                    className="mt-2"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({
            year: "",
            heading_en: "",
            heading_ar: "",
            body_en: null,
            body_ar: null,
          })
        }
        className="gap-2"
      >
        <IconPlus className="size-4" />
        {copy.timelineAdd}
      </Button>

      <FormFooter
        isPending={isPending}
        updatedAt={updatedAt}
        locale={locale}
        copy={copy}
      />
    </form>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────

function FooterForm({
  initial,
  updatedAt,
  locale,
  copy,
}: {
  initial: Footer;
  updatedAt: string | null;
  locale: "ar" | "en";
  copy: ContentAdminCopy;
}) {
  const { save, isPending } = useSave<Footer>("footer", locale, copy);
  const { register, handleSubmit } = useForm<Footer>({
    resolver: (zodResolver as unknown as (s: unknown) => Resolver<Footer>)(
      footerSchema,
    ),
    defaultValues: initial,
  });

  const onSubmit: SubmitHandler<Footer> = (data) => save(data);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-xl border border-border bg-card p-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{copy.footerTaglineEn}</Label>
          <Textarea dir="ltr" rows={3} {...register("tagline_en")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.footerTaglineAr}</Label>
          <Textarea dir="rtl" rows={3} {...register("tagline_ar")} className="mt-2" />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-tight">
          {copy.footerSocialsTitle}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <SocialField
            icon={<IconBrandLinkedin className="size-4" />}
            label={copy.footerLinkedin}
            register={register("socials.linkedin")}
          />
          <SocialField
            icon={<IconBrandX className="size-4" />}
            label={copy.footerTwitter}
            register={register("socials.twitter")}
          />
          <SocialField
            icon={<IconBrandFacebook className="size-4" />}
            label={copy.footerFacebook}
            register={register("socials.facebook")}
          />
          <SocialField
            icon={<IconBrandInstagram className="size-4" />}
            label={copy.footerInstagram}
            register={register("socials.instagram")}
          />
          <SocialField
            icon={<IconBrandYoutube className="size-4" />}
            label={copy.footerYoutube}
            register={register("socials.youtube")}
          />
        </div>
      </div>

      <FormFooter
        isPending={isPending}
        updatedAt={updatedAt}
        locale={locale}
        copy={copy}
      />
    </form>
  );
}

function SocialField({
  icon,
  label,
  register,
}: {
  icon: React.ReactNode;
  label: string;
  register: ReturnType<ReturnType<typeof useForm>["register"]>;
}) {
  return (
    <div>
      <Label className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <Input dir="ltr" placeholder="https://…" {...register} className="mt-2" />
    </div>
  );
}

// ── Contact ────────────────────────────────────────────────────────────────

function ContactForm({
  initial,
  updatedAt,
  locale,
  copy,
}: {
  initial: Contact;
  updatedAt: string | null;
  locale: "ar" | "en";
  copy: ContentAdminCopy;
}) {
  const { save, isPending } = useSave<Contact>("contact", locale, copy);
  const { register, handleSubmit } = useForm<Contact>({
    resolver: (zodResolver as unknown as (s: unknown) => Resolver<Contact>)(
      contactSchema,
    ),
    defaultValues: initial,
  });

  const onSubmit: SubmitHandler<Contact> = (data) => save(data);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-xl border border-border bg-card p-5"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{copy.contactHqAddressEn}</Label>
          <Textarea dir="ltr" rows={2} {...register("hq_address_en")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.contactHqAddressAr}</Label>
          <Textarea dir="rtl" rows={2} {...register("hq_address_ar")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.contactHqPhone}</Label>
          <Input dir="ltr" {...register("hq_phone")} className="mt-2" />
        </div>
        <div />
        <div>
          <Label>{copy.contactBranchAddressEn}</Label>
          <Textarea dir="ltr" rows={2} {...register("branch_address_en")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.contactBranchAddressAr}</Label>
          <Textarea dir="rtl" rows={2} {...register("branch_address_ar")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.contactBranchPhone}</Label>
          <Input dir="ltr" {...register("branch_phone")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.contactEmail}</Label>
          <Input dir="ltr" {...register("email")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.contactHoursEn}</Label>
          <Input dir="ltr" {...register("hours_en")} className="mt-2" />
        </div>
        <div>
          <Label>{copy.contactHoursAr}</Label>
          <Input dir="rtl" {...register("hours_ar")} className="mt-2" />
        </div>
      </div>

      <FormFooter
        isPending={isPending}
        updatedAt={updatedAt}
        locale={locale}
        copy={copy}
      />
    </form>
  );
}
