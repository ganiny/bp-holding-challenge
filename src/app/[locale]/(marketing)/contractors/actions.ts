"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { contractorApplicationSchema } from "@/lib/validation/contractor-application";
import { getLimiter, getClientIp } from "@/lib/rate-limit";
import { sendMail } from "@/lib/email/send";

export type SubmitContractorApplicationResult =
  | { ok: true }
  | { ok: false; code: "rate_limited" | "validation" | "server_error" };

export async function submitContractorApplication(
  raw: unknown,
): Promise<SubmitContractorApplicationResult> {
  const parsed = contractorApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "validation" };
  }
  const data = parsed.data;

  const hdrs = await headers();
  const ip = getClientIp(hdrs);

  const limiter = getLimiter({
    prefix: "contractor-app",
    limit: 3,
    windowSeconds: 60 * 60,
  });
  const { success } = await limiter.limit(ip);
  if (!success) {
    return { ok: false, code: "rate_limited" };
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { error: insertErr } = await supabase
      .from("contractor_applications")
      .insert({
        company_name: data.companyName,
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        city: data.city,
        cr_number: data.crNumber,
        vat_number: data.vatNumber,
        specialty_en: data.specialtyEn,
        specialty_ar: data.specialtyAr,
        years_experience: data.yearsExperience,
        website: data.website,
        document_paths: data.documentPaths,
        notes: data.notes,
        ip_address: ip === "unknown" ? null : ip,
      });
    if (insertErr) {
      console.error("[contractor-application] insert failed", insertErr);
      return { ok: false, code: "server_error" };
    }

    const adminTo = process.env.MAIL_ADMIN_TO ?? process.env.SMTP_USER;

    await Promise.allSettled([
      sendMail({
        to: data.email,
        template: "contractor-application-confirmation",
        data: {
          contactName: data.contactName,
          companyName: data.companyName,
        },
        locale: data.locale,
      }),
      adminTo
        ? sendMail({
            to: adminTo,
            template: "admin-notification",
            data: {
              kind: "Contractor",
              summary: `${data.companyName} (${data.contactName}) submitted a contractor/supplier registration`,
              details: [
                { label: "Company", value: data.companyName },
                { label: "Contact", value: data.contactName },
                { label: "Email", value: data.email },
                { label: "Phone", value: data.phone },
                {
                  label: "Location",
                  value: [data.city, data.country].filter(Boolean).join(", ") || "—",
                },
                { label: "CR number", value: data.crNumber ?? "—" },
                { label: "VAT", value: data.vatNumber ?? "—" },
                {
                  label: "Specialty",
                  value: [data.specialtyEn, data.specialtyAr]
                    .filter(Boolean)
                    .join(" / ") || "—",
                },
                {
                  label: "Years experience",
                  value:
                    data.yearsExperience !== null
                      ? String(data.yearsExperience)
                      : "—",
                },
                { label: "Website", value: data.website ?? "—" },
                {
                  label: "Documents",
                  value: data.documentPaths.length
                    ? data.documentPaths.join("\n")
                    : "—",
                },
              ],
            },
            locale: "en",
            replyTo: data.email,
          })
        : Promise.resolve(),
    ]);

    revalidatePath(`/${data.locale}/admin/contractors`);
    return { ok: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, code: "validation" };
    }
    console.error("[contractor-application] unexpected error", err);
    return { ok: false, code: "server_error" };
  }
}
