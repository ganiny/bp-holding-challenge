import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/supabase";

/**
 * Service-role Supabase client. Bypasses RLS.
 *
 * SERVER-ONLY. Never import into a Client Component or expose the key.
 * Use sparingly: admin operations, seed scripts, webhook handlers, cron jobs.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
