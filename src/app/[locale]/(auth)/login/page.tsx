import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { next } = await searchParams;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    type ProfileLookup = { role: "admin" | "employee" | "member"; must_change_password: boolean };
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("role, must_change_password")
      .eq("id", user.id)
      .maybeSingle();
    const profile = profileRow as ProfileLookup | null;

    if (profile?.must_change_password) {
      redirect(`/${locale}/change-password`);
    }
    if (profile?.role === "admin") redirect(`/${locale}/admin`);
    if (profile?.role === "employee") redirect(`/${locale}/employee`);
    redirect(`/${locale}`);
  }

  const t = await getTranslations("auth.login");

  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";
  const safeNext =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : null;

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-brand-cream/10 bg-brand-navy/60 p-8 shadow-2xl backdrop-blur-md sm:p-10">
        <p className="text-xs font-mono uppercase tracking-[0.24em] text-brand-gold">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-brand-cream/75">{t("lead")}</p>

        <div className="mt-7">
          <LoginForm
            locale={localeTyped}
            next={safeNext}
            copy={{
              email: t("form.email"),
              emailPlaceholder: t("form.emailPlaceholder"),
              password: t("form.password"),
              passwordPlaceholder: t("form.passwordPlaceholder"),
              showPassword: t("form.showPassword"),
              hidePassword: t("form.hidePassword"),
              submit: t("form.submit"),
              submitting: t("form.submitting"),
              errorInvalidCredentials: t("form.errorInvalidCredentials"),
              errorRateLimited: t("form.errorRateLimited"),
              errorValidation: t("form.errorValidation"),
              errorGeneric: t("form.errorGeneric"),
            }}
          />
        </div>

        <p className="mt-6 text-xs text-brand-cream/60">{t("internalOnly")}</p>
      </div>
    </div>
  );
}
