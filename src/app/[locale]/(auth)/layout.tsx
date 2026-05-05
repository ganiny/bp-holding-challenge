import { setRequestLocale } from "next-intl/server";
import { ParticleField } from "@/components/effects/ParticleField";
import { Link } from "@/lib/i18n/navigation";
import Image from "next/image";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-brand-navy text-brand-cream">
      <ParticleField
        position="absolute"
        opacity={0.18}
        particleCount={70}
        connectionDistance={150}
        className="z-0"
      />

      <header className="relative z-10 px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-cream"
          aria-label="BP Holding"
        >
          <Image
            src="/bp-holding.svg"
            alt="BP Holding"
            width={120}
            height={32}
            className="h-8 w-auto brightness-0 invert"
            priority
          />
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4 sm:px-6">
        {children}
      </main>
    </div>
  );
}
