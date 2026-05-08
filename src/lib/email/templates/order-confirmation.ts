import { emailShell, plainShell } from "./_shell";

export type OrderConfirmationData = {
  fullName: string;
  orderNumber: string;
  total: string;
};

export function orderConfirmation(
  data: OrderConfirmationData,
  locale: "ar" | "en",
) {
  if (locale === "ar") {
    const subject = `تأكيد الطلب — ${data.orderNumber}`;
    const text = plainShell(
      "ar",
      `مرحباً ${data.fullName}،\n\nشكراً لطلبك من متجر بزنس بايونيرز.\nتم استلام طلبك برقم ${data.orderNumber} بإجمالي ${data.total} ر.س.\nسيقوم فريقنا بمراجعة الطلب والتواصل معك لتأكيد الدفع والشحن.\n\nمع تحياتنا،\nفريق بزنس بايونيرز`,
    );
    const html = emailShell({
      locale: "ar",
      preheader: "تم استلام طلبك",
      body: `
        <p style="margin:0 0 16px;">مرحباً <strong>${escape(data.fullName)}</strong>،</p>
        <p style="margin:0 0 16px;">شكراً لطلبك من متجر <strong>بزنس بايونيرز</strong>. تم استلام طلبك بنجاح.</p>
        <p style="margin:0 0 8px;">رقم الطلب: <code style="background:#f5f0e6;padding:2px 8px;border-radius:4px;color:#052a42;">${escape(data.orderNumber)}</code></p>
        <p style="margin:0 0 16px;">الإجمالي: <strong style="color:#df9a13;">${escape(data.total)} ر.س</strong></p>
        <p style="margin:0 0 16px;">سيقوم فريقنا بمراجعة الطلب والتواصل معك خلال 24 ساعة لتأكيد الدفع وترتيب الشحن.</p>
        <p style="margin:24px 0 0;color:#5b6b78;font-size:13px;">مع تحياتنا،<br>فريق بزنس بايونيرز</p>
      `,
    });
    return { subject, html, text };
  }

  const subject = `Order confirmation — ${data.orderNumber}`;
  const text = plainShell(
    "en",
    `Hello ${data.fullName},\n\nThank you for shopping with Business Pioneers Holding.\nYour order ${data.orderNumber} has been received with a total of ${data.total} SAR.\nOur team will review your order and reach out to confirm payment and shipping.\n\nBest regards,\nBP Holding team`,
  );
  const html = emailShell({
    locale: "en",
    preheader: "Your order has been received",
    body: `
      <p style="margin:0 0 16px;">Hello <strong>${escape(data.fullName)}</strong>,</p>
      <p style="margin:0 0 16px;">Thank you for shopping with <strong>Business Pioneers Holding</strong>. Your order has been received.</p>
      <p style="margin:0 0 8px;">Order number: <code style="background:#f5f0e6;padding:2px 8px;border-radius:4px;color:#052a42;">${escape(data.orderNumber)}</code></p>
      <p style="margin:0 0 16px;">Total: <strong style="color:#df9a13;">${escape(data.total)} SAR</strong></p>
      <p style="margin:0 0 16px;">Our team will review your order and reach out within 24 hours to confirm payment and arrange shipping.</p>
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
