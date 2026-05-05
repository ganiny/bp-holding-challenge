import { emailShell, plainShell } from "./_shell";

export type AdminNotificationData = {
  /** Short label like "RFQ", "Contact", "Job application", "Contractor". */
  kind: string;
  /** Free-text summary line shown prominently. */
  summary: string;
  /** Optional structured fields rendered as a table. */
  details?: Array<{ label: string; value: string }>;
  /** Optional admin URL for one-click jump. */
  link?: string;
};

/**
 * Sent to MAIL_ADMIN_TO whenever a public form is submitted.
 * Always English (admin-facing); locale param is ignored but required by sendMail().
 */
export function adminNotification(data: AdminNotificationData, _locale: "ar" | "en") {
  const subject = `[BP Holding] new ${data.kind.toLowerCase()} submission`;

  const detailsRows =
    data.details
      ?.map(
        (d) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#5b6b78;font-size:13px;">${esc(d.label)}</td><td style="padding:6px 0;font-size:13px;">${esc(d.value)}</td></tr>`,
      )
      .join("") ?? "";

  const text = plainShell(
    "en",
    `New ${data.kind} submission\n\n${data.summary}\n\n${(data.details ?? []).map((d) => `${d.label}: ${d.value}`).join("\n")}\n\n${data.link ? `Open in admin: ${data.link}\n` : ""}`,
  );

  const html = emailShell({
    locale: "en",
    preheader: `New ${data.kind} submission`,
    body: `
      <p style="margin:0 0 8px;color:#5b6b78;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">${esc(data.kind)} submission</p>
      <p style="margin:0 0 24px;font-size:18px;font-weight:600;">${esc(data.summary)}</p>
      ${detailsRows ? `<table style="width:100%;border-collapse:collapse;border-top:1px solid #eee5d4;border-bottom:1px solid #eee5d4;margin:16px 0;"><tbody>${detailsRows}</tbody></table>` : ""}
      ${data.link ? `<p style="margin:24px 0 0;"><a href="${esc(data.link)}" style="display:inline-block;background:#052a42;color:#fbf9f4;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Open in admin →</a></p>` : ""}
    `,
  });

  return { subject, html, text };
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
