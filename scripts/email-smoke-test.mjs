/**
 * Step 9 verification — fire a real RFQ-confirmation email through Gmail SMTP
 * to MAIL_ADMIN_TO and report the message ID. Run once, check inbox.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import nodemailer from "nodemailer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = {};
for (const line of readFileSync(join(__dirname, "..", ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) {
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    env[m[1]] = v;
  }
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT ?? 465),
  secure: String(env.SMTP_SECURE ?? "true") === "true",
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

console.log(`→ Sending test email via ${env.SMTP_HOST} as ${env.SMTP_USER}`);
console.log(`  to: ${env.MAIL_ADMIN_TO}`);

try {
  const info = await transporter.sendMail({
    from: env.MAIL_FROM ?? `BP Holding <${env.SMTP_USER}>`,
    to: env.MAIL_ADMIN_TO,
    subject: "[BP Holding] Step 9 SMTP smoke test",
    text:
      "If you're reading this, the Nodemailer transporter and Gmail SMTP credentials in .env.local both work. Safe to delete.",
    html: `<div style="font-family:Inter,Arial,sans-serif;color:#052a42;padding:24px;background:#fbf9f4;">
      <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#5b6b78;">BP Holding · Step 9</p>
      <h1 style="margin:8px 0 16px;color:#052a42;">SMTP smoke test ✓</h1>
      <p>Nodemailer + Gmail SMTP work. The transporter is wired and ready to send transactional confirmations.</p>
    </div>`,
  });
  console.log(`✓ accepted by SMTP: messageId=${info.messageId}`);
  console.log(`  recipients accepted: ${(info.accepted ?? []).join(", ") || "(none)"}`);
  if (info.rejected?.length) {
    console.log(`  rejected: ${info.rejected.join(", ")}`);
  }
} catch (e) {
  console.error("✗ send failed:", e.message);
  process.exit(1);
}
