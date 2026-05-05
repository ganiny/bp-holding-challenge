import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/lib/i18n/routing";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

const intl = createIntlMiddleware(routing);

const PROTECTED_PREFIXES = ["/admin", "/employee"];
const AUTH_ROUTES = ["/login"];

function stripLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  const first = segments[0];
  if ((routing.locales as readonly string[]).includes(first)) {
    return "/" + segments.slice(1).join("/");
  }
  return pathname;
}

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if ((routing.locales as readonly string[]).includes(first)) return first;
  return routing.defaultLocale;
}

export default async function proxy(request: NextRequest) {
  // 1) i18n routing — adds/normalizes the [locale] prefix.
  const intlResponse = intl(request);

  // If next-intl returned a redirect/rewrite, honor it before doing auth work.
  if (intlResponse.headers.get("location")) return intlResponse;

  // 2) Refresh the Supabase auth cookie on every request.
  const { user } = await updateSupabaseSession(request, intlResponse);

  // 3) Role-based gating for protected route prefixes.
  const pathname = request.nextUrl.pathname;
  const localeStripped = stripLocale(pathname);
  const locale = getLocaleFromPath(pathname);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => localeStripped === prefix || localeStripped.startsWith(`${prefix}/`),
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => localeStripped === route || localeStripped.startsWith(`${route}/`),
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/admin`;
    return NextResponse.redirect(url);
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
