"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jobApplicationSchema } from "@/lib/validation/job-application";
import { getLimiter, getClientIp } from "@/lib/rate-limit";
import { sendMail } from "@/lib/email/send";

export type SubmitJobApplicationResult =
  | { ok: true }
  | { ok: false; code: "rate_limited" | "validation" | "server_error" };

export async function submitJobApplication(
  raw: unknown,
): Promise<SubmitJobApplicationResult> {
  const parsed = jobApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "validation" };
  }
  const data = parsed.data;

  const hdrs = await headers();
  const ip = getClientIp(hdrs);

  const limiter = getLimiter({
    prefix: "job-app",
    limit: 5,
    windowSeconds: 60 * 60,
  });
  const { success } = await limiter.limit(ip);
  if (!success) {
    return { ok: false, code: "rate_limited" };
  }

  try {
    const supabase = await createSupabaseServerClient();

    let careerTitle: string | null = null;
    if (data.careerId) {
      const { data: career } = await supabase
        .from("careers")
        .select("title_en,title_ar")
        .eq("id", data.careerId)
        .maybeSingle();
      if (career) {
        careerTitle = data.locale === "ar" ? career.title_ar : career.title_en;
      }
    }

    const { error: insertErr } = await supabase.from("job_applications").insert({
      career_id: data.careerId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      cover_letter: data.coverLetter,
      cv_file_path: data.cvFilePath,
      portfolio_url: data.portfolioUrl,
      linkedin_url: data.linkedinUrl,
      ip_address: ip === "unknown" ? null : ip,
    });
    if (insertErr) {
      console.error("[job-application] insert failed", insertErr);
      return { ok: false, code: "server_error" };
    }

    const adminTo = process.env.MAIL_ADMIN_TO ?? process.env.SMTP_USER;

    await Promise.allSettled([
      sendMail({
        to: data.email,
        template: "job-application-confirmation",
        data: { fullName: data.fullName, jobTitle: careerTitle ?? undefined },
        locale: data.locale,
      }),
      adminTo
        ? sendMail({
            to: adminTo,
            template: "admin-notification",
            data: {
              kind: "Job application",
              summary: `${data.fullName} applied for ${careerTitle ?? data.careerSlug}`,
              details: [
                { label: "Email", value: data.email },
                { label: "Phone", value: data.phone ?? "—" },
                { label: "Role", value: careerTitle ?? data.careerSlug },
                { label: "CV path", value: data.cvFilePath },
                { label: "Portfolio", value: data.portfolioUrl ?? "—" },
                { label: "LinkedIn", value: data.linkedinUrl ?? "—" },
              ],
            },
            locale: "en",
            replyTo: data.email,
          })
        : Promise.resolve(),
    ]);

    revalidatePath(`/${data.locale}/admin/job-applications`);
    return { ok: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, code: "validation" };
    }
    console.error("[job-application] unexpected error", err);
    return { ok: false, code: "server_error" };
  }
}
