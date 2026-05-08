import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsAdminClient } from "@/components/admin/SettingsAdminClient";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.settingsAdmin");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${localeTyped}/login?next=/admin/settings`);

  const { data: row } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();
  const profile = row as
    | {
        id: string;
        email: string;
        full_name: string | null;
        phone: string | null;
        avatar_url: string | null;
        role: "admin" | "employee" | "member";
      }
    | null;
  if (!profile || profile.role !== "admin") {
    redirect(`/${localeTyped}/admin`);
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("lead")}</p>
      </header>

      <SettingsAdminClient
        locale={localeTyped}
        profile={{
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
        }}
        copy={{
          tabProfile: t("tabs.profile"),
          tabPassword: t("tabs.password"),
          // Profile
          profileTitle: t("profile.title"),
          profileSubtitle: t("profile.subtitle"),
          profileEmail: t("profile.email"),
          profileEmailHint: t("profile.emailHint"),
          profileFullName: t("profile.fullName"),
          profileFullNamePlaceholder: t("profile.fullNamePlaceholder"),
          profilePhone: t("profile.phone"),
          profilePhonePlaceholder: t("profile.phonePlaceholder"),
          profileAvatar: t("profile.avatar"),
          profileAvatarHint: t("profile.avatarHint"),
          profileAvatarReplace: t("profile.avatarReplace"),
          profileAvatarRemove: t("profile.avatarRemove"),
          profileSave: t("profile.save"),
          profileSaving: t("profile.saving"),
          profileSuccess: t("profile.success"),
          profileErrorValidation: t("profile.errorValidation"),
          profileErrorUnauthorized: t("profile.errorUnauthorized"),
          profileErrorGeneric: t("profile.errorGeneric"),
          // Password
          passwordTitle: t("password.title"),
          passwordSubtitle: t("password.subtitle"),
          passwordCurrent: t("password.current"),
          passwordCurrentPlaceholder: t("password.currentPlaceholder"),
          passwordNew: t("password.new"),
          passwordNewPlaceholder: t("password.newPlaceholder"),
          passwordConfirm: t("password.confirm"),
          passwordConfirmPlaceholder: t("password.confirmPlaceholder"),
          passwordShow: t("password.show"),
          passwordHide: t("password.hide"),
          passwordSubmit: t("password.submit"),
          passwordSubmitting: t("password.submitting"),
          passwordRuleMin: t("password.ruleMin"),
          passwordRuleLower: t("password.ruleLower"),
          passwordRuleUpper: t("password.ruleUpper"),
          passwordRuleDigit: t("password.ruleDigit"),
          passwordSuccess: t("password.success"),
          passwordErrorInvalidCurrent: t("password.errorInvalidCurrent"),
          passwordErrorMismatch: t("password.errorMismatch"),
          passwordErrorSameAsCurrent: t("password.errorSameAsCurrent"),
          passwordErrorValidation: t("password.errorValidation"),
          passwordErrorUnauthorized: t("password.errorUnauthorized"),
          passwordErrorGeneric: t("password.errorGeneric"),
        }}
      />
    </section>
  );
}
