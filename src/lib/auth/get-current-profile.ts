import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/supabase";

export type CurrentProfile = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  mustChangePassword: boolean;
};

type ProfileRow = {
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  must_change_password: boolean;
};

/**
 * Resolves the signed-in user's profile, or null if not signed in.
 * Returns null silently for anon visitors so callers can handle redirect/UX.
 */
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row } = await supabase
    .from("profiles")
    .select("email, full_name, avatar_url, role, must_change_password")
    .eq("id", user.id)
    .maybeSingle();
  const profile = row as ProfileRow | null;

  if (!profile) return null;

  return {
    id: user.id,
    email: profile.email,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    role: profile.role,
    mustChangePassword: profile.must_change_password,
  };
}
