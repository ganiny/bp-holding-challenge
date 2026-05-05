"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { contactMessageSchema } from "@/lib/validation/contact";
import { getLimiter, getClientIp } from "@/lib/rate-limit";
import { sendMail } from "@/lib/email/send";

export type SubmitContactResult =
  | { ok: true }
  | { ok: false; code: "rate_limited" | "validation" | "server_error" };

export async function submitContactMessage(
  raw: unknown,
): Promise<SubmitContactResult> {
  const parsed = contactMessageSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "validation" };
  }
  const data = parsed.data;

  const hdrs = await headers();
  const ip = getClientIp(hdrs);

  const limiter = getLimiter({
    prefix: "contact",
    limit: 5,
    windowSeconds: 60 * 60,
  });
  const { success } = await limiter.limit(ip);
  if (!success) {
    return { ok: false, code: "rate_limited" };
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { error: insertErr } = await supabase
      .from("contact_messages")
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        ip_address: ip === "unknown" ? null : ip,
      });

    if (insertErr) {
      console.error("[contact] insert failed", insertErr);
      return { ok: false, code: "server_error" };
    }

    const adminTo = process.env.MAIL_ADMIN_TO ?? process.env.SMTP_USER;

    await Promise.allSettled([
      sendMail({
        to: data.email,
        template: "contact-confirmation",
        data: { fullName: data.fullName },
        locale: data.locale,
      }),
      adminTo
        ? sendMail({
            to: adminTo,
            template: "admin-notification",
            data: {
              kind: "Contact message",
              summary: `${data.fullName} sent a message${data.subject ? `: ${data.subject}` : ""}`,
              details: [
                { label: "Name", value: data.fullName },
                { label: "Email", value: data.email },
                { label: "Phone", value: data.phone ?? "—" },
                { label: "Subject", value: data.subject ?? "—" },
                { label: "Message", value: data.message },
              ],
            },
            locale: "en",
            replyTo: data.email,
          })
        : Promise.resolve(),
    ]);

    revalidatePath(`/${data.locale}/admin/messages`);
    return { ok: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, code: "validation" };
    }
    console.error("[contact] unexpected error", err);
    return { ok: false, code: "server_error" };
  }
}
