import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/${locale}/login?next=/${locale}/admin`);
  }
  if (profile.mustChangePassword) {
    redirect(`/${locale}/change-password`);
  }
  if (profile.role !== "admin") {
    redirect(`/${locale}/employee`);
  }

  const t = await getTranslations("admin");
  const localeTyped: "ar" | "en" = locale === "ar" ? "ar" : "en";

  return (
    <AdminShell
      locale={localeTyped}
      profile={{
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role,
        avatarUrl: profile.avatarUrl,
      }}
      copy={{
        brand: t("shell.brand"),
        sectionMain: t("shell.sectionMain"),
        sectionContent: t("shell.sectionContent"),
        sectionSettings: t("shell.sectionSettings"),
        roleAdmin: t("shell.roleAdmin"),
        signOut: t("shell.signOut"),
        signingOut: t("shell.signingOut"),
        collapse: t("shell.collapse"),
        expand: t("shell.expand"),
        openMenu: t("shell.openMenu"),
        closeMenu: t("shell.closeMenu"),
        navOverview: t("nav.overview"),
        navProjects: t("nav.projects"),
        navStudio: t("nav.studio"),
        navCareers: t("nav.careers"),
        navJobApplications: t("nav.jobApplications"),
        navContractors: t("nav.contractors"),
        navRfqs: t("nav.rfqs"),
        navMessages: t("nav.messages"),
        navCertifications: t("nav.certifications"),
        navContent: t("nav.content"),
        navSettings: t("nav.settings"),
        breadcrumbAdmin: t("breadcrumbs.admin"),
      }}
    >
      {children}
    </AdminShell>
  );
}
