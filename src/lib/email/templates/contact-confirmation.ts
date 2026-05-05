import { emailShell, plainShell } from "./_shell";

export type ContactConfirmationData = { fullName: string };

export function contactConfirmation(
  data: ContactConfirmationData,
  locale: "ar" | "en",
) {
  if (locale === "ar") {
    return {
      subject: "تم استلام رسالتك — بزنس بايونيرز",
      text: plainShell(
        "ar",
        `مرحباً ${data.fullName}،\n\nشكراً لتواصلك معنا. وصلتنا رسالتك وسيقوم فريقنا بالرد قريباً.\n\nمع تحياتنا،\nفريق بزنس بايونيرز`,
      ),
      html: emailShell({
        locale: "ar",
        preheader: "تم استلام رسالتك",
        body: `<p style="margin:0 0 16px;">مرحباً <strong>${esc(data.fullName)}</strong>،</p>
               <p style="margin:0 0 16px;">شكراً لتواصلك مع <strong>بزنس بايونيرز</strong>. وصلتنا رسالتك وسيقوم فريقنا بالرد عليها قريباً.</p>
               <p style="margin:24px 0 0;color:#5b6b78;font-size:13px;">مع تحياتنا،<br>فريق بزنس بايونيرز</p>`,
      }),
    };
  }
  return {
    subject: "We received your message — BP Holding",
    text: plainShell(
      "en",
      `Hello ${data.fullName},\n\nThanks for reaching out. We've received your message and a team member will reply shortly.\n\nBest regards,\nBP Holding team`,
    ),
    html: emailShell({
      locale: "en",
      preheader: "We received your message",
      body: `<p style="margin:0 0 16px;">Hello <strong>${esc(data.fullName)}</strong>,</p>
             <p style="margin:0 0 16px;">Thanks for reaching out to <strong>BP Holding</strong>. We've received your message and a team member will reply shortly.</p>
             <p style="margin:24px 0 0;color:#5b6b78;font-size:13px;">Best regards,<br>BP Holding team</p>`,
    }),
  };
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
