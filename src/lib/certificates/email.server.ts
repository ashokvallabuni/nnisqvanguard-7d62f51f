/**
 * Server-side durable email queue & dispatcher for certificates.
 * Architecture:
 * - Uses Resend API via server environment variables (RESEND_API_KEY).
 * - Fallback to verified SMTP if RESEND_API_KEY is not configured.
 * - Queue worker: uses SKIP LOCKED semantics and exponential backoff.
 * - Constraints: UNIQUE(certificate_id) ensures at most one email record per certificate.
 */
import nodemailer from "nodemailer";

export interface EmailJobResult {
  status: "SENT" | "FAILED";
  providerMessageId?: string;
  error?: string;
}

export function buildCertificateEmailTemplate(data: {
  recipientName: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
  verificationUrl: string;
  downloadUrl?: string;
  blockchainConfirmed?: boolean;
}) {
  const subject = "Congratulations! You have successfully completed your course - NISQ Vanguard Academy";
  const chainStatusText = data.blockchainConfirmed ? "Confirmed on-chain (Polygon PoS)" : "Blockchain verification pending";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050b14; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 620px; margin: 0 auto; background-color: #0b1526; border: 1px solid #16283a; border-radius: 12px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    .header { text-align: center; border-bottom: 1px solid #16283a; padding-bottom: 24px; margin-bottom: 24px; }
    .logo-text { font-size: 14px; font-weight: 700; color: #0a7cff; letter-spacing: 2px; }
    .academy-text { font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-top: 4px; }
    .headline { font-size: 24px; font-weight: 800; color: #ffffff; margin: 16px 0 8px 0; }
    .subtext { font-size: 15px; color: #94a3b8; line-height: 1.6; }
    .cert-card { background-color: #07101d; border: 1px solid #0a7cff; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .cert-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .cert-label { color: #64748b; font-size: 12px; text-transform: uppercase; }
    .cert-val { color: #00e5ff; font-weight: 600; }
    .btn { display: inline-block; background-color: #0a7cff; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 14px; margin-top: 16px; }
    .footer { text-align: center; margin-top: 32px; border-top: 1px solid #16283a; padding-top: 24px; font-size: 12px; color: #64748b; }
    .motto { color: #00e5ff; font-weight: 600; margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">NISQ VANGUARD — DEFENCE TECHNOLOGIES</div>
      <div class="academy-text">Cyber Academy • Official Verified Credential</div>
    </div>

    <h1 class="headline">Congratulations, ${data.recipientName}!</h1>
    <p class="subtext">
      You have successfully met all rigorous practical and theoretical requirements for <strong>${data.courseTitle}</strong>.
      Your official certificate has been issued and registered into the NISQ Vanguard Credential Vault.
    </p>

    <div class="cert-card">
      <div class="cert-row"><span class="cert-label">Certificate ID:</span> <span class="cert-val">${data.certificateId}</span></div>
      <div class="cert-row"><span class="cert-label">Issue Date:</span> <span style="color:#ffffff;">${data.completionDate}</span></div>
      <div class="cert-row"><span class="cert-label">Blockchain Anchor:</span> <span style="color:#94a3b8;">${chainStatusText}</span></div>
    </div>

    <div style="text-align: center;">
      ${
        data.downloadUrl
          ? `<a href="${data.downloadUrl}" class="btn" style="margin-right: 12px;">Download Official PDF</a>`
          : ""
      }
      <a href="${data.verificationUrl}" class="btn" style="background-color: transparent; border: 1px solid #00e5ff; color: #00e5ff !important;">Verify Authenticity</a>
    </div>

    <p style="font-size: 12px; color: #64748b; margin-top: 20px; text-align: center;">
      Note: Direct download links expire for your security. Fresh download links and verification records are always accessible from your student dashboard.
    </p>

    <div class="footer">
      <div class="motto">Secure Today. Defend Tomorrow. Empower Forever.</div>
      <div>NISQ Vanguard Cyber Academy • Defence Technologies</div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Congratulations, ${data.recipientName}!

You have successfully completed your course: ${data.courseTitle}.
Completion Date: ${data.completionDate}
Certificate ID: ${data.certificateId}
Blockchain Status: ${chainStatusText}

Public Verification: ${data.verificationUrl}
${data.downloadUrl ? `Download Certificate: ${data.downloadUrl}\n` : ""}

Secure Today. Defend Tomorrow. Empower Forever.
NISQ Vanguard Cyber Academy — Defence Technologies
  `.trim();

  return { subject, html, text };
}

export async function sendCertificateEmail(data: {
  recipientEmail: string;
  recipientName: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
  verificationUrl: string;
  downloadUrl?: string;
  blockchainConfirmed?: boolean;
}): Promise<EmailJobResult> {
  const resendApiKey = process.env.RESEND_API_KEY;

  const { subject, html, text } = buildCertificateEmailTemplate(data);

  // Path 1: Primary provider = Resend
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM || "NISQ Vanguard Academy <certificates@nisqvanguard.in>",
          to: [data.recipientEmail],
          subject,
          html,
          text,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        return {
          status: "FAILED",
          error: resData?.message || `Resend HTTP error ${response.status}`,
        };
      }

      return {
        status: "SENT",
        providerMessageId: resData?.id,
      };
    } catch (err: any) {
      return {
        status: "FAILED",
        error: err?.message || String(err),
      };
    }
  }

  // Path 2: Fallback provider = SMTP
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return {
      status: "FAILED",
      error: "Neither RESEND_API_KEY nor SMTP credentials configured in server environment.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === "465",
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || "ashokvallabuni@nisqvanguard.in",
      to: data.recipientEmail,
      subject,
      html,
      text,
    });

    return {
      status: "SENT",
      providerMessageId: info.messageId,
    };
  } catch (err: any) {
    return {
      status: "FAILED",
      error: err?.message || String(err),
    };
  }
}
