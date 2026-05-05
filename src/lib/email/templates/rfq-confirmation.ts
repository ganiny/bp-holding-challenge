import { emailShell, plainShell } from "./_shell";

export type RfqConfirmationData = {
  fullName: string;
  rfqId: string;
};

export function rfqConfirmation(
  data: RfqConfirmationData,
  locale: "ar" | "en",
) {
  if (locale === "ar") {
    const subject = `تم استلام طلب عرض السعر — ${data.rfqId.slice(0, 8)}`;
    const text = plainShell(
      "ar",
      `مرحباً ${data.fullName}،\n\nشكراً لتواصلك مع بزنس بايونيرز.\nتم استلام طلب عرض السعر برقم ${data.rfqId}، وسيقوم فريقنا بمراجعته والتواصل معك خلال يومي عمل.\n\nمع تحياتنا،\nفريق بزنس بايونيرز`,
    );
    const html = emailShell({
      locale: "ar",
      preheader: "تم استلام طلب عرض السعر",
      body: `
        <p style="margin:0 0 16px;">مرحباً <strong>${escape(data.fullName)}</strong>،</p>
        <p style="margin:0 0 16px;">شكراً لتواصلك مع <strong>بزنس بايونيرز</strong>. تم استلام طلب عرض السعر الخاص بك.</p>
        <p style="margin:0 0 16px;">رقم الطلب: <code style="background:#f5f0e6;padding:2px 8px;border-radius:4px;color:#052a42;">${escape(data.rfqId)}</code></p>
        <p style="margin:0 0 16px;">سيقوم فريقنا بمراجعة طلبك والتواصل معك خلال يومي عمل.</p>
        <p style="margin:24px 0 0;color:#5b6b78;font-size:13px;">مع تحياتنا،<br>فريق بزنس بايونيرز</p>
      `,
    });
    return { subject, html, text };
  }

  const subject = `Your quote request was received — ${data.rfqId.slice(0, 8)}`;
  const text = plainShell(
    "en",
    `Hello ${data.fullName},\n\nThank you for reaching out to Business Pioneers Holding.\nYour quote request has been received with reference ${data.rfqId}. Our team will review it and get back to you within two business days.\n\nBest regards,\nBP Holding team`,
  );
  const html = emailShell({
    locale: "en",
    preheader: "Your quote request was received",
    body: `
      <p style="margin:0 0 16px;">Hello <strong>${escape(data.fullName)}</strong>,</p>
      <p style="margin:0 0 16px;">Thank you for reaching out to <strong>Business Pioneers Holding</strong>. Your quote request has been received.</p>
      <p style="margin:0 0 16px;">Reference: <code style="background:#f5f0e6;padding:2px 8px;border-radius:4px;color:#052a42;">${escape(data.rfqId)}</code></p>
      <p style="margin:0 0 16px;">Our team will review your request and get back to you within two business days.</p>
      <p style="margin:24px 0 0;color:#5b6b78;font-size:13px;">Best regards,<br>BP Holding team</p>
    `,
  });
  return { subject, html, text };
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
