"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOut(locale: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const safeLocale = locale === "ar" || locale === "en" ? locale : "ar";
  redirect(`/${safeLocale}/login`);
}
