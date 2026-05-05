/**
 * Minimal HTML shell for transactional emails.
 * Brand-consistent (navy + gold), inline styles for client compatibility.
 * Polished templates land in Step 38.
 */

type ShellOpts = {
  locale: "ar" | "en";
  preheader?: string;
  body: string;
};

export function emailShell({ locale, preheader = "", body }: ShellOpts): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const align = locale === "ar" ? "right" : "left";
  const fontFamily =
    locale === "ar"
      ? "'Cairo', 'Segoe UI', Arial, sans-serif"
      : "'Inter', 'Segoe UI', Arial, sans-serif";

  return `<!doctype html>
<html lang="${locale}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BP Holding</title>
</head>
<body style="margin:0;padding:0;background:#fbf9f4;font-family:${fontFamily};color:#052a42;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fbf9f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(5,42,66,0.08);">
          <tr>
            <td style="background:#052a42;padding:24px 32px;text-align:${align};">
              <span style="color:#df9a13;font-weight:700;letter-spacing:0.04em;font-size:18px;">BP HOLDING</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;text-align:${align};font-size:15px;line-height:1.65;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#fbf9f4;padding:20px 32px;border-top:1px solid #eee5d4;text-align:${align};font-size:12px;color:#5b6b78;">
              Business Pioneers Holding · Riyadh, King Fahd Road · info@BPholding.net
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function plainShell(locale: "ar" | "en", body: string): string {
  const sign =
    locale === "ar"
      ? "\n\n--\nبزنس بايونيرز القابضة\nالرياض، طريق الملك فهد\ninfo@BPholding.net"
      : "\n\n--\nBusiness Pioneers Holding\nRiyadh, King Fahd Road\ninfo@BPholding.net";
  return body + sign;
}
