import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/supabase";

/**
 * Refreshes the Supabase auth cookie on every matched request.
 * Called from src/proxy.ts. Returns the (possibly mutated) NextResponse plus
 * the Supabase user (if any) so the proxy can do role-based gating.
 */
export async function updateSupabaseSession(
  request: NextRequest,
  response: NextResponse,
) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Triggers session refresh (sets new cookies on `response` if needed).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, supabase };
}
