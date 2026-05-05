import type { Metadata } from "next";
import { Inter, Cairo, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { routing, localeDirection, type Locale } from "@/lib/i18n/routing";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-en",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin", "latin-ext"],
  variable: "--font-ar",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BP Holding — Business Pioneers Holding",
    template: "%s · BP Holding",
  },
  description:
    "Business Pioneers Holding — premium Saudi engineering, contracting, and integrated business solutions.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = localeDirection[locale as Locale];

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className="h-full">
      <body
        className={cn(
          "min-h-full flex flex-col antialiased",
          inter.variable,
          cairo.variable,
          jetbrainsMono.variable,
        )}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position={dir === "rtl" ? "top-left" : "top-right"} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
