import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.changePassword" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ChangePasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("auth.changePassword");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

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
          <ChangePasswordForm
            locale={localeTyped}
            copy={{
              currentPassword: t("form.currentPassword"),
              currentPasswordPlaceholder: t("form.currentPasswordPlaceholder"),
              newPassword: t("form.newPassword"),
              newPasswordPlaceholder: t("form.newPasswordPlaceholder"),
              confirmPassword: t("form.confirmPassword"),
              confirmPasswordPlaceholder: t("form.confirmPasswordPlaceholder"),
              showPassword: t("form.showPassword"),
              hidePassword: t("form.hidePassword"),
              submit: t("form.submit"),
              submitting: t("form.submitting"),
              ruleMin: t("form.ruleMin"),
              ruleLower: t("form.ruleLower"),
              ruleUpper: t("form.ruleUpper"),
              ruleDigit: t("form.ruleDigit"),
              errorInvalidCurrent: t("form.errorInvalidCurrent"),
              errorMismatch: t("form.errorMismatch"),
              errorSameAsCurrent: t("form.errorSameAsCurrent"),
              errorValidation: t("form.errorValidation"),
              errorGeneric: t("form.errorGeneric"),
              errorNotAuthenticated: t("form.errorNotAuthenticated"),
            }}
          />
        </div>
      </div>
    </div>
  );
}
