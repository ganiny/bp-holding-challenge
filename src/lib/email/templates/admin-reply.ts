import { emailShell, plainShell } from "./_shell";

export type AdminReplyData = {
  /** Subject line typed by the admin. */
  subject: string;
  /** Greeting line including the recipient's name, e.g. "Hi Sara,". */
  greeting: string;
  /** Free-form message body, plain text. Newlines preserved as paragraphs in HTML. */
  body: string;
  /** Optional reference label shown at the top, e.g. "RFQ #abc123" — helps the recipient match the thread. */
  reference?: string;
};

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Generic admin-typed reply, branded shell. Used for replying to an RFQ,
 * contact message, or any other inbound submission from the admin console.
 *
 * Subject is taken from the admin's own input (we don't prefix or modify it).
 */
export function adminReply(data: AdminReplyData, locale: "ar" | "en") {
  const subject = data.subject;

  const paragraphs = data.body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

  const ref = data.reference
    ? `<p style="margin:0 0 16px;color:#5b6b78;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">${esc(data.reference)}</p>`
    : "";

  const text = plainShell(
    locale,
    `${data.reference ? `${data.reference}\n\n` : ""}${data.greeting}\n\n${data.body}`,
  );

  const html = emailShell({
    locale,
    preheader: data.subject,
    body: `
      ${ref}
      <p style="margin:0 0 16px;font-size:16px;font-weight:600;">${esc(data.greeting)}</p>
      ${paragraphs}
    `,
  });

  return { subject, html, text };
}
