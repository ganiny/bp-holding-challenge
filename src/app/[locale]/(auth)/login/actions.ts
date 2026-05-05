"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validation/auth";
import { getLimiter, getClientIp } from "@/lib/rate-limit";

export type SignInResult =
  | { ok: false; code: "rate_limited" | "validation" | "invalid_credentials" | "server_error" };

export async function signIn(raw: unknown): Promise<SignInResult> {
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "validation" };
  }
  const data = parsed.data;

  const hdrs = await headers();
  const ip = getClientIp(hdrs);

  const limiter = getLimiter({
    prefix: "auth-login",
    limit: 8,
    windowSeconds: 15 * 60,
  });
  const { success } = await limiter.limit(`${ip}:${data.email.toLowerCase()}`);
  if (!success) {
    return { ok: false, code: "rate_limited" };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { ok: false, code: "invalid_credentials" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "server_error" };
  }

  type ProfileLookup = { role: "admin" | "employee" | "member"; must_change_password: boolean };
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role, must_change_password")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRow as ProfileLookup | null;

  const role = profile?.role ?? "employee";
  const mustChange = profile?.must_change_password ?? false;

  let dest: string;
  if (mustChange) {
    dest = `/${data.locale}/change-password`;
  } else if (data.next && data.next.startsWith("/") && !data.next.startsWith("//")) {
    dest = data.next;
  } else if (role === "admin") {
    dest = `/${data.locale}/admin`;
  } else if (role === "employee") {
    dest = `/${data.locale}/employee`;
  } else {
    dest = `/${data.locale}`;
  }

  redirect(dest);
}
