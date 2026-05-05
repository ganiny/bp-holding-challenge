import { emailShell, plainShell } from "./_shell";

export type JobApplicationConfirmationData = {
  fullName: string;
  jobTitle?: string;
};

export function jobApplicationConfirmation(
  data: JobApplicationConfirmationData,
  locale: "ar" | "en",
) {
  const role = data.jobTitle ?? (locale === "ar" ? "الوظيفة المطلوبة" : "the role");

  if (locale === "ar") {
    return {
      subject: "تم استلام طلب التوظيف — بزنس بايونيرز",
      text: plainShell(
        "ar",
        `مرحباً ${data.fullName}،\n\nشكراً لتقديمك على ${role}. وصلنا طلبك وسيقوم فريق الموارد البشرية بمراجعته.\n\nمع تحياتنا،\nفريق بزنس بايونيرز`,
      ),
      html: emailShell({
        locale: "ar",
        preheader: "تم استلام طلب التوظيف",
        body: `<p style="margin:0 0 16px;">مرحباً <strong>${esc(data.fullName)}</strong>،</p>
               <p style="margin:0 0 16px;">شكراً لتقديمك على <strong>${esc(role)}</strong>. تم استلام طلبك وسيقوم فريق الموارد البشرية بمراجعته.</p>
               <p style="margin:24px 0 0;color:#5b6b78;font-size:13px;">مع تحياتنا،<br>فريق بزنس بايونيرز</p>`,
      }),
    };
  }
  return {
    subject: "Your application was received — BP Holding",
    text: plainShell(
      "en",
      `Hello ${data.fullName},\n\nThank you for applying to ${role}. We've received your application and our HR team will review it.\n\nBest regards,\nBP Holding team`,
    ),
    html: emailShell({
      locale: "en",
      preheader: "Your application was received",
      body: `<p style="margin:0 0 16px;">Hello <strong>${esc(data.fullName)}</strong>,</p>
             <p style="margin:0 0 16px;">Thank you for applying to <strong>${esc(role)}</strong>. We've received your application and our HR team will review it.</p>
             <p style="margin:24px 0 0;color:#5b6b78;font-size:13px;">Best regards,<br>BP Holding team</p>`,
    }),
  };
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
