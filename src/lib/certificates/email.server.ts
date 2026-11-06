/**
 * Server-side durable email queue & dispatcher for certificates using the official Resend SDK.
 * Follows Resend Node.js setup specification:
 * - Uses `import { Resend } from "resend"`
 * - Client instantiated with process.env.RESEND_API_KEY
 * - Supports verified custom domains (e.g. certificates@nisqvanguard.in) or testing via onboarding@resend.dev
 */
import { Resend } from "resend";

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
      <a href="${data.verificationUrl}" class="btn" style="background-color: transparent; border: 1px solid #00e5ff; color: #00e5ff !important; margin-right: 12px;">Verify Authenticity</a>
      <a href="https://nisqvanguard.in/courses" class="btn" style="background-color: #16283a; border: 1px solid #334155; color: #f8fafc !important;">Continue Learning &rarr;</a>
    </div>

    <div style="background-color: #07101d; border-left: 3px solid #0a7cff; padding: 12px 16px; margin-top: 24px; border-radius: 4px;">
      <div style="font-size: 13px; font-weight: 600; color: #f8fafc;">Continue Your Tactical Journey</div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Ready for your next mission? Explore advanced specialized modules and master tracks in the NISQ Vanguard Cyber Academy catalog.</div>
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
Continue Learning: https://nisqvanguard.in/courses

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
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return {
      status: "FAILED",
      error: "RESEND_API_KEY is not configured in server environment.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { subject, html, text } = buildCertificateEmailTemplate(data);

    const fromAddress = process.env.MAIL_FROM || "NISQ Vanguard Academy <ashokvallabuni@nisqvanguard.in>";

    const { data: resData, error: resError } = await resend.emails.send({
      from: fromAddress,
      to: [data.recipientEmail],
      reply_to: "ashokvallabuni@nisqvanguard.in",
      subject,
      html,
      text,
    });

    if (resError) {
      return {
        status: "FAILED",
        error: resError.message || JSON.stringify(resError),
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

/**
 * Durable retry worker for certificate email jobs with backoff and deduplication.
 */
export async function retryCertificateEmailJob({
  jobId,
  forceFailure,
}: {
  jobId: string;
  forceFailure?: boolean;
}): Promise<{
  status: "SENT" | "FAILED" | "ALREADY_SENT";
  providerMessageId?: string;
  from?: string;
  recipient?: string;
  attempts?: number;
  sentAt?: string;
  nextRetryAt?: string;
  backoffDelayMs?: number;
  error?: string;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: job, error: jobErr } = await supabaseAdmin
    .from("certificate_email_jobs")
    .select("*, certificates(*)")
    .eq("id", jobId)
    .maybeSingle();

  if (jobErr || !job) {
    return { status: "FAILED", error: "JOB_NOT_FOUND" };
  }

  // Idempotency: If already successfully SENT, never duplicate email
  if (job.delivery_status === "SENT") {
    return {
      status: "ALREADY_SENT",
      providerMessageId: job.provider_message_id,
      from: process.env.MAIL_FROM || "NISQ Vanguard Academy <ashokvallabuni@nisqvanguard.in>",
      recipient: job.recipient_email,
      attempts: job.attempts,
      sentAt: job.updated_at,
    };
  }

  const cert = job.certificates;
  if (!cert) {
    return { status: "FAILED", error: "CERTIFICATE_NOT_FOUND" };
  }

  const nextAttempts = (job.attempts || 0) + 1;

  if (forceFailure) {
    const errorMsg = "Simulated provider network timeout / 503 Service Unavailable";
    const backoffDelayMs = Math.min(1000 * Math.pow(2, nextAttempts), 60000);
    const nextRetryAt = new Date(Date.now() + backoffDelayMs).toISOString();

    await supabaseAdmin
      .from("certificate_email_jobs")
      .update({
        delivery_status: "FAILED",
        attempts: nextAttempts,
        last_error: errorMsg,
        next_retry_at: nextRetryAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return {
      status: "FAILED",
      attempts: nextAttempts,
      backoffDelayMs,
      nextRetryAt,
      error: errorMsg,
    };
  }

  // Generate fresh download link
  let downloadUrl: string | undefined;
  if (cert.pdf_path) {
    const { data: signedData } = await supabaseAdmin.storage
      .from("certificates")
      .createSignedUrl(cert.pdf_path, 60 * 15);
    downloadUrl = signedData?.signedUrl;
  }

  const baseUrl = process.env.SITE_URL || "https://nisqvanguard.in";
  const verificationUrl = `${baseUrl}/verify-certificate/${cert.certificate_number}`;

  const sendResult = await sendCertificateEmail({
    recipientEmail: job.recipient_email,
    recipientName: cert.recipient_name,
    courseTitle: cert.course_title,
    completionDate: new Date(cert.issued_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    certificateId: cert.certificate_number,
    verificationUrl,
    downloadUrl,
    blockchainConfirmed: cert.blockchain_status === "CONFIRMED",
  });

  if (sendResult.status === "SENT") {
    const sentAt = new Date().toISOString();
    await supabaseAdmin
      .from("certificate_email_jobs")
      .update({
        delivery_status: "SENT",
        attempts: nextAttempts,
        provider_message_id: sendResult.providerMessageId,
        last_error: null,
        next_retry_at: null,
        updated_at: sentAt,
      })
      .eq("id", jobId);

    await supabaseAdmin
      .from("certificates")
      .update({ email_status: "SENT" })
      .eq("id", cert.id);

    await supabaseAdmin.from("certificate_audit_logs").insert({
      certificate_id: cert.id,
      user_id: cert.user_id,
      actor_id: cert.user_id,
      event_type: "CERTIFICATE_EMAIL_SENT",
      details: {
        jobId,
        providerMessageId: sendResult.providerMessageId,
        attempts: nextAttempts,
        sentAt,
      },
    });

    return {
      status: "SENT",
      providerMessageId: sendResult.providerMessageId,
      from: process.env.MAIL_FROM || "NISQ Vanguard Academy <ashokvallabuni@nisqvanguard.in>",
      recipient: job.recipient_email,
      attempts: nextAttempts,
      sentAt,
    };
  } else {
    const backoffDelayMs = Math.min(1000 * Math.pow(2, nextAttempts), 60000);
    const nextRetryAt = new Date(Date.now() + backoffDelayMs).toISOString();

    await supabaseAdmin
      .from("certificate_email_jobs")
      .update({
        delivery_status: "FAILED",
        attempts: nextAttempts,
        last_error: sendResult.error,
        next_retry_at: nextRetryAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    await supabaseAdmin
      .from("certificates")
      .update({ email_status: "FAILED" })
      .eq("id", cert.id);

    return {
      status: "FAILED",
      attempts: nextAttempts,
      backoffDelayMs,
      nextRetryAt,
      error: sendResult.error,
    };
  }
}

/**
 * Scheduled Worker: Claims and processes pending and retry-due email jobs with row locking.
 * Self-healing: releases jobs stuck in PROCESSING older than timeoutSeconds.
 */
export async function processQueuedCertificateEmailJobs(options?: {
  batchSize?: number;
  timeoutSeconds?: number;
}): Promise<{
  claimed: number;
  processed: number;
  sent: number;
  failed: number;
  results: Array<{
    jobId: string;
    recipient: string;
    status: string;
    providerMessageId?: string;
    error?: string;
  }>;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const batchSize = options?.batchSize || 10;
  const timeoutSeconds = options?.timeoutSeconds || 300;

  // 1. Claim jobs atomically via PostgreSQL claim_next_email_jobs RPC (SKIP LOCKED)
  const { data: claimedJobs, error: claimErr } = await supabaseAdmin.rpc("claim_next_email_jobs", {
    batch_size: batchSize,
    timeout_seconds: timeoutSeconds,
  });

  if (claimErr) {
    console.error("[Email Worker Claim Error]", claimErr);
    return { claimed: 0, processed: 0, sent: 0, failed: 0, results: [] };
  }

  const jobs = claimedJobs || [];
  const results: Array<{
    jobId: string;
    recipient: string;
    status: string;
    providerMessageId?: string;
    error?: string;
  }> = [];

  let sentCount = 0;
  let failedCount = 0;

  for (const job of jobs) {
    const certId = job.certificate_id;
    const { data: cert } = await supabaseAdmin
      .from("certificates")
      .select("id, user_id, certificate_number, recipient_name, course_title, issued_at, blockchain_status, pdf_path")
      .eq("id", certId)
      .maybeSingle();

    if (!cert) {
      await supabaseAdmin
        .from("certificate_email_jobs")
        .update({
          delivery_status: "FAILED",
          last_error: "Certificate record missing",
          locked_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      failedCount++;
      results.push({ jobId: job.id, recipient: job.recipient_email, status: "FAILED", error: "Certificate record missing" });
      continue;
    }

    // Never send before PDF exists in storage!
    if (!cert.pdf_path) {
      await supabaseAdmin
        .from("certificate_email_jobs")
        .update({
          delivery_status: "PENDING",
          locked_at: null,
          last_error: "Waiting for PDF generation",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      results.push({ jobId: job.id, recipient: job.recipient_email, status: "WAITING_PDF" });
      continue;
    }

    const { data: signedData, error: signErr } = await supabaseAdmin.storage
      .from("certificates")
      .createSignedUrl(cert.pdf_path, 60 * 60 * 24); // 24-hour signed link for initial email

    if (signErr || !signedData?.signedUrl) {
      await supabaseAdmin
        .from("certificate_email_jobs")
        .update({
          delivery_status: "PENDING",
          locked_at: null,
          last_error: "Unable to sign PDF download URL",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      results.push({ jobId: job.id, recipient: job.recipient_email, status: "WAITING_PDF_SIGNED_URL" });
      continue;
    }

    const nextAttempts = (job.attempts || 0) + 1;
    const baseUrl = process.env.SITE_URL || "https://nisqvanguard.in";
    const verificationUrl = `${baseUrl}/verify-certificate/${cert.certificate_number}`;

    const sendRes = await sendCertificateEmail({
      recipientEmail: job.recipient_email,
      recipientName: cert.recipient_name,
      courseTitle: cert.course_title,
      completionDate: new Date(cert.issued_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      certificateId: cert.certificate_number,
      verificationUrl,
      downloadUrl: signedData.signedUrl,
      blockchainConfirmed: cert.blockchain_status === "CONFIRMED",
    });

    if (sendRes.status === "SENT") {
      const nowIso = new Date().toISOString();
      await supabaseAdmin
        .from("certificate_email_jobs")
        .update({
          delivery_status: "SENT",
          sent_at: nowIso,
          attempts: nextAttempts,
          provider_message_id: sendRes.providerMessageId,
          last_error: null,
          next_retry_at: null,
          locked_at: null,
          updated_at: nowIso,
        })
        .eq("id", job.id);

      await supabaseAdmin
        .from("certificates")
        .update({ email_status: "SENT" })
        .eq("id", cert.id);

      await supabaseAdmin.from("certificate_audit_logs").insert({
        certificate_id: cert.id,
        user_id: cert.user_id,
        actor_id: cert.user_id,
        event_type: "CERTIFICATE_EMAIL_WORKER_SENT",
        details: {
          jobId: job.id,
          providerMessageId: sendRes.providerMessageId,
          attempts: nextAttempts,
          sentAt: nowIso,
        },
      });

      sentCount++;
      results.push({
        jobId: job.id,
        recipient: job.recipient_email,
        status: "SENT",
        providerMessageId: sendRes.providerMessageId,
      });
    } else {
      const backoffDelayMs = Math.min(1000 * Math.pow(2, nextAttempts), 3600000);
      const nextRetryAt = new Date(Date.now() + backoffDelayMs).toISOString();
      const finalFailed = nextAttempts >= 5;

      await supabaseAdmin
        .from("certificate_email_jobs")
        .update({
          delivery_status: "FAILED",
          attempts: nextAttempts,
          last_error: sendRes.error,
          next_retry_at: finalFailed ? null : nextRetryAt,
          locked_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      await supabaseAdmin
        .from("certificates")
        .update({ email_status: "FAILED" })
        .eq("id", cert.id);

      failedCount++;
      results.push({
        jobId: job.id,
        recipient: job.recipient_email,
        status: "FAILED",
        error: sendRes.error,
      });
    }
  }

  return {
    claimed: jobs.length,
    processed: results.length,
    sent: sentCount,
    failed: failedCount,
    results,
  };
}

/**
 * Self-healing: release jobs stuck in PROCESSING older than timeoutSeconds
 */
export async function releaseStuckEmailJobs(timeoutSeconds: number = 300) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const cutoff = new Date(Date.now() - timeoutSeconds * 1000).toISOString();

  const { data: released, error } = await supabaseAdmin
    .from("certificate_email_jobs")
    .update({
      delivery_status: "PENDING",
      locked_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("delivery_status", "PROCESSING")
    .lt("locked_at", cutoff)
    .select("id, recipient_email, locked_at");

  return { released: released || [], error };
}

/**
 * Handle Resend Webhooks: email.delivered, email.bounced, email.complained
 */
export async function handleResendWebhook({
  payload,
  headers,
}: {
  payload: string;
  headers: { id?: string; timestamp?: string; signature?: string };
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (webhookSecret && headers.id && headers.timestamp && headers.signature) {
    const resend = new Resend(process.env.RESEND_API_KEY || "dummy");
    try {
      resend.webhooks.verify({
        payload,
        headers: {
          id: headers.id,
          timestamp: headers.timestamp,
          signature: headers.signature,
        },
        webhookSecret,
      });
    } catch (err: any) {
      console.error("[Resend Webhook Verification Failed]", err);
      return { verified: false, error: "INVALID_SIGNATURE" };
    }
  }

  const event = typeof payload === "string" ? JSON.parse(payload) : payload;
  const eventType = event.type; // 'email.delivered', 'email.bounced', 'email.complained'
  const emailId = event.data?.email_id;

  if (!emailId) {
    return { verified: true, updated: false, reason: "NO_EMAIL_ID" };
  }

  if (eventType === "email.delivered") {
    const deliveredAt = event.created_at || new Date().toISOString();
    await supabaseAdmin
      .from("certificate_email_jobs")
      .update({
        delivery_status: "DELIVERED",
        delivered_at: deliveredAt,
        updated_at: new Date().toISOString(),
      })
      .eq("provider_message_id", emailId);

    return { verified: true, updated: true, eventType, status: "DELIVERED" };
  } else if (eventType === "email.bounced") {
    const reason = event.data?.bounce?.message || "Email address bounced";
    await supabaseAdmin
      .from("certificate_email_jobs")
      .update({
        delivery_status: "BOUNCED",
        last_error: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("provider_message_id", emailId);

    return { verified: true, updated: true, eventType, status: "BOUNCED", reason };
  } else if (eventType === "email.complained") {
    await supabaseAdmin
      .from("certificate_email_jobs")
      .update({
        delivery_status: "COMPLAINED",
        updated_at: new Date().toISOString(),
      })
      .eq("provider_message_id", emailId);

    return { verified: true, updated: true, eventType, status: "COMPLAINED" };
  }

  return { verified: true, updated: false, eventType };
}
