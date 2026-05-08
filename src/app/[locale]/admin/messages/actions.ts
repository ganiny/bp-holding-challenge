"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/email/send";
import {
  messageStatusSchema,
  messageDeleteSchema,
  messageReplySchema,
} from "@/lib/validation/contactMessage";

type Result<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | {
      ok: false;
      code:
        | "unauthorized"
        | "validation"
        | "not_found"
        | "send_failed"
        | "server_error";
      reason?: string;
    };

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();
  const profile = row as
    | {
        role: "admin" | "employee" | "member";
        full_name: string | null;
        email: string | null;
      }
    | null;
  if (profile?.role !== "admin") return null;
  return { user, profile };
}

function revalidateAll(locale: string) {
  const safe = locale === "en" ? "en" : "ar";
  revalidatePath(`/${safe}/admin/messages`);
  revalidatePath(`/${safe}/admin`);
}

export async function setMessageStatus(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = messageStatusSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("contact_messages")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/messages] status update failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function deleteMessage(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = messageDeleteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("contact_messages")
    .delete()
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/messages] delete failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

/**
 * Send an admin-typed reply to the contact submitter.
 * Bumps status: new → read → replied (replied takes priority).
 */
export async function replyToMessage(
  raw: unknown,
  locale: string,
): Promise<Result<{ messageId: string }>> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "unauthorized" };

  const parsed = messageReplySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { data: row } = await admin
    .from("contact_messages")
    .select("id, full_name, email, status")
    .eq("id", parsed.data.id)
    .maybeSingle();
  const msg = row as
    | { id: string; full_name: string; email: string; status: string }
    | null;
  if (!msg) return { ok: false, code: "not_found" };

  const safeLocale: "ar" | "en" = locale === "en" ? "en" : "ar";
  const greeting =
    safeLocale === "ar" ? `مرحباً ${msg.full_name}،` : `Hi ${msg.full_name},`;
  const reference = `Message #${msg.id.slice(0, 8)}`;

  try {
    const info = await sendMail({
      to: msg.email,
      template: "admin-reply",
      data: {
        subject: parsed.data.subject,
        greeting,
        body: parsed.data.body,
        reference,
      },
      locale: safeLocale,
      replyTo: session.profile.email ?? undefined,
    });

    const { error: bumpErr } = await admin
      .from("contact_messages")
      .update({ status: "replied" })
      .eq("id", msg.id);
    if (bumpErr) {
      console.error("[admin/messages] reply bump failed", bumpErr);
    }

    revalidateAll(locale);
    return { ok: true, data: { messageId: info.messageId } };
  } catch (e) {
    console.error("[admin/messages] reply send failed", e);
    return { ok: false, code: "send_failed" };
  }
}
