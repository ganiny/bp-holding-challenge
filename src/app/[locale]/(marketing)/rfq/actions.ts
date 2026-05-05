"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rfqSchema } from "@/lib/validation/rfq";
import { getLimiter, getClientIp } from "@/lib/rate-limit";
import { sendMail } from "@/lib/email/send";

export type SubmitRfqResult =
  | { ok: true; rfqId: string }
  | { ok: false; code: "rate_limited" | "validation" | "server_error" };

export async function submitRfq(raw: unknown): Promise<SubmitRfqResult> {
  const parsed = rfqSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "validation" };
  }
  const data = parsed.data;

  const hdrs = await headers();
  const ip = getClientIp(hdrs);

  const limiter = getLimiter({
    prefix: "rfq",
    limit: 5,
    windowSeconds: 60 * 60,
  });
  const { success } = await limiter.limit(ip);
  if (!success) {
    return { ok: false, code: "rate_limited" };
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data: inserted, error: insertErr } = await supabase
      .from("rfqs")
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        project_type: data.projectType,
        budget: data.budget,
        location: data.location,
        start_date: data.startDate,
        description: data.description,
        attachment_paths: data.attachmentPaths,
        ip_address: ip === "unknown" ? null : ip,
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      console.error("[rfq] insert failed", insertErr);
      return { ok: false, code: "server_error" };
    }

    const rfqId = inserted.id;
    const adminTo = process.env.MAIL_ADMIN_TO ?? process.env.SMTP_USER;

    await Promise.allSettled([
      sendMail({
        to: data.email,
        template: "rfq-confirmation",
        data: { fullName: data.fullName, rfqId },
        locale: data.locale,
      }),
      adminTo
        ? sendMail({
            to: adminTo,
            template: "admin-notification",
            data: {
              kind: "RFQ",
              summary: `${data.fullName} requested a quote (${data.projectType ?? "no project type"})`,
              details: [
                { label: "Reference", value: rfqId },
                { label: "Name", value: data.fullName },
                { label: "Email", value: data.email },
                { label: "Phone", value: data.phone },
                { label: "Company", value: data.company ?? "—" },
                { label: "Project type", value: data.projectType ?? "—" },
                { label: "Budget", value: data.budget },
                { label: "Location", value: data.location ?? "—" },
                { label: "Target start", value: data.startDate ?? "—" },
                { label: "Description", value: data.description },
                {
                  label: "Attachments",
                  value: data.attachmentPaths.length
                    ? data.attachmentPaths.join("\n")
                    : "—",
                },
              ],
            },
            locale: "en",
            replyTo: data.email,
          })
        : Promise.resolve(),
    ]);

    revalidatePath(`/${data.locale}/admin/rfqs`);
    return { ok: true, rfqId };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, code: "validation" };
    }
    console.error("[rfq] unexpected error", err);
    return { ok: false, code: "server_error" };
  }
}
