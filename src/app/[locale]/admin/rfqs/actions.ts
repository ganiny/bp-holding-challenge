"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSignedUrl } from "@/lib/imagekit/server";
import { sendMail } from "@/lib/email/send";
import {
  rfqStatusSchema,
  rfqNotesSchema,
  rfqDeleteSchema,
  rfqAttachmentSchema,
  rfqReplySchema,
} from "@/lib/validation/rfqAdmin";

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
    | { role: "admin" | "employee" | "member"; full_name: string | null; email: string | null }
    | null;
  if (profile?.role !== "admin") return null;
  return { user, profile };
}

function revalidateAll(locale: string) {
  const safe = locale === "en" ? "en" : "ar";
  revalidatePath(`/${safe}/admin/rfqs`);
  revalidatePath(`/${safe}/admin`);
}

export async function setRfqStatus(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = rfqStatusSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("rfqs")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/rfqs] status update failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function setRfqNotes(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = rfqNotesSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("rfqs")
    .update({ internal_notes: parsed.data.notes })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/rfqs] notes update failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function deleteRfq(
  raw: unknown,
  locale: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = rfqDeleteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("rfqs").delete().eq("id", parsed.data.id);
  if (error) {
    console.error("[admin/rfqs] delete failed", error);
    return { ok: false, code: "server_error" };
  }

  revalidateAll(locale);
  return { ok: true };
}

export async function getRfqAttachmentUrl(
  raw: unknown,
): Promise<Result<{ url: string; filePath: string }>> {
  if (!(await requireAdmin())) return { ok: false, code: "unauthorized" };

  const parsed = rfqAttachmentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { data: row } = await admin
    .from("rfqs")
    .select("attachment_paths")
    .eq("id", parsed.data.id)
    .maybeSingle();
  const found = row as { attachment_paths: string[] | null } | null;
  const paths = found?.attachment_paths ?? [];
  const filePath = paths[parsed.data.index];
  if (!filePath) return { ok: false, code: "not_found" };

  try {
    const url = getSignedUrl(filePath, 300);
    return { ok: true, data: { url, filePath } };
  } catch (e) {
    console.error("[admin/rfqs] sign attachment failed", e);
    return { ok: false, code: "server_error" };
  }
}

/**
 * Sends an admin-authored reply to the RFQ submitter.
 * Reply-To is set to the admin's own email so threaded responses come back to them.
 * Status is bumped to 'in_progress' if it was 'new'.
 */
export async function replyToRfq(
  raw: unknown,
  locale: string,
): Promise<Result<{ messageId: string }>> {
  const session = await requireAdmin();
  if (!session) return { ok: false, code: "unauthorized" };

  const parsed = rfqReplySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "validation" };

  const admin = createSupabaseAdminClient();
  const { data: row } = await admin
    .from("rfqs")
    .select("id, full_name, email, status")
    .eq("id", parsed.data.id)
    .maybeSingle();
  const rfq = row as
    | { id: string; full_name: string; email: string; status: string }
    | null;
  if (!rfq) return { ok: false, code: "not_found" };

  const safeLocale: "ar" | "en" = locale === "en" ? "en" : "ar";
  const greeting =
    safeLocale === "ar"
      ? `مرحباً ${rfq.full_name}،`
      : `Hi ${rfq.full_name},`;
  const reference = `RFQ #${rfq.id.slice(0, 8)}`;

  try {
    const info = await sendMail({
      to: rfq.email,
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

    if (rfq.status === "new") {
      const { error: bumpErr } = await admin
        .from("rfqs")
        .update({ status: "in_progress" })
        .eq("id", rfq.id);
      if (bumpErr) {
        console.error("[admin/rfqs] reply bump status failed", bumpErr);
      }
    }

    revalidateAll(locale);
    return { ok: true, data: { messageId: info.messageId } };
  } catch (e) {
    console.error("[admin/rfqs] reply send failed", e);
    return { ok: false, code: "send_failed" };
  }
}
