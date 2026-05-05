import "server-only";
import { getMailTransporter } from "./transporter";
import { rfqConfirmation } from "./templates/rfq-confirmation";
import { contactConfirmation } from "./templates/contact-confirmation";
import { jobApplicationConfirmation } from "./templates/job-application-confirmation";
import { contractorApplicationConfirmation } from "./templates/contractor-application-confirmation";
import { adminNotification } from "./templates/admin-notification";

export type Locale = "ar" | "en";

type TemplateMap = {
  "rfq-confirmation": Parameters<typeof rfqConfirmation>[0];
  "contact-confirmation": Parameters<typeof contactConfirmation>[0];
  "job-application-confirmation": Parameters<typeof jobApplicationConfirmation>[0];
  "contractor-application-confirmation": Parameters<
    typeof contractorApplicationConfirmation
  >[0];
  "admin-notification": Parameters<typeof adminNotification>[0];
};

const templates = {
  "rfq-confirmation": rfqConfirmation,
  "contact-confirmation": contactConfirmation,
  "job-application-confirmation": jobApplicationConfirmation,
  "contractor-application-confirmation": contractorApplicationConfirmation,
  "admin-notification": adminNotification,
} as const;

export async function sendMail<T extends keyof TemplateMap>(opts: {
  to: string | string[];
  template: T;
  data: TemplateMap[T];
  locale: Locale;
  replyTo?: string;
}) {
  const tpl = templates[opts.template] as (
    data: TemplateMap[T],
    locale: Locale,
  ) => { subject: string; html: string; text: string };
  const { subject, html, text } = tpl(opts.data, opts.locale);

  const from = process.env.MAIL_FROM ?? `BP Holding <${process.env.SMTP_USER}>`;

  const transporter = getMailTransporter();
  const info = await transporter.sendMail({
    from,
    to: opts.to,
    subject,
    html,
    text,
    replyTo: opts.replyTo,
  });

  return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
}
