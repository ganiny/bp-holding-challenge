import { setRequestLocale } from "next-intl/server";

export default async function EmployeePlaceholder({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Step 6 placeholder · gated
        </p>
        <h1 className="text-2xl font-semibold mt-2">Employee</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Reaching this page means you have a valid Supabase session.
        </p>
      </div>
    </main>
  );
}
