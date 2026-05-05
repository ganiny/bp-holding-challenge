import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/supabase";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Browser-side Supabase client (singleton).
 * Use in Client Components only — never import from a Server Component.
 */
export function createSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  }
  return browserClient;
}
