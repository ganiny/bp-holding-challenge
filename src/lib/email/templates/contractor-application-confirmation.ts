import { emailShell, plainShell } from "./_shell";

export type ContractorApplicationConfirmationData = {
  contactName: string;
  companyName: string;
};

export function contractorApplicationConfirmation(
  data: ContractorApplicationConfirmationData,
  locale: "ar" | "en",
) {
  if (locale === "ar") {
    return {
      subject: "تم استلام طلب التسجيل — بزنس بايونيرز",
      text: plainShell(
        "ar",
        `مرحباً ${data.contactName}،\n\nشكراً لتقديم بيانات شركتكم "${data.companyName}". سيتم مراجعة الطلب والوثائق المرفقة والرد عليكم قريباً.\n\nمع تحياتنا،\nفريق بزنس بايونيرز`,
      ),
      html: emailShell({
        locale: "ar",
        preheader: "تم استلام طلب تسجيل المقاول/المورد",
        body: `<p style="margin:0 0 16px;">مرحباً <strong>${esc(data.contactName)}</strong>،</p>
               <p style="margin:0 0 16px;">شكراً لتقديم بيانات شركتكم <strong>${esc(data.companyName)}</strong>. سيتم مراجعة الطلب والوثائق المرفقة والرد عليكم قريباً.</p>
               <p style="margin:24px 0 0;color:#5b6b78;font-size:13px;">مع تحياتنا،<br>فريق بزنس بايونيرز</p>`,
      }),
    };
  }
  return {
    subject: "Your registration was received — BP Holding",
    text: plainShell(
      "en",
      `Hello ${data.contactName},\n\nThank you for submitting ${data.companyName}'s registration. Our procurement team will review the application and supporting documents and respond shortly.\n\nBest regards,\nBP Holding team`,
    ),
    html: emailShell({
      locale: "en",
      preheader: "Your contractor/supplier registration was received",
      body: `<p style="margin:0 0 16px;">Hello <strong>${esc(data.contactName)}</strong>,</p>
             <p style="margin:0 0 16px;">Thank you for submitting <strong>${esc(data.companyName)}</strong>'s registration. Our procurement team will review the application and supporting documents and respond shortly.</p>
             <p style="margin:24px 0 0;color:#5b6b78;font-size:13px;">Best regards,<br>BP Holding team</p>`,
    }),
  };
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
