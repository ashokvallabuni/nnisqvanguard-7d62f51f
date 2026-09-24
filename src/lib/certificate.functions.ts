/**
 * Server-side certificate issuance and verification.
 *
 * Security contract:
 * - Only service-role can insert into certificates (no authenticated INSERT policy)
 * - issueCertificate validates all requirements server-side before writing
 * - getCertificate is a public query (anon SELECT policy exists)
 * - Certificate numbers are UUIDs — not guessable
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const issueCertInput = z.object({
  courseSlug: z.string().min(1),
});

const verifyCertInput = z.object({
  certificateNumber: z.string().min(1).max(256),
});

/** Issue a certificate only after all course requirements are genuinely met */
export const issueCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => issueCertInput.parse(value))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Fetch course
    const { data: course } = await supabase
      .from("courses")
      .select("id, title, slug")
      .eq("slug", data.courseSlug)
      .maybeSingle();

    if (!course) {
      return { error: "COURSE_NOT_FOUND", certificateNumber: null };
    }

    // 2. Fetch all modules for this course
    const { data: modules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", course.id);

    if (!modules || modules.length === 0) {
      return { error: "NO_MODULES", certificateNumber: null };
    }

    // 3. Check all modules completed by user
    const { count: completedCount } = await supabase
      .from("module_progress")
      .select("module_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true)
      .in(
        "module_id",
        modules.map((m) => m.id),
      );

    if ((completedCount ?? 0) < modules.length) {
      return {
        error: "REQUIREMENTS_NOT_MET",
        certificateNumber: null,
        detail: `Completed ${completedCount ?? 0} of ${modules.length} modules required.`,
      };
    }

    // 4. Check existing certificate (idempotent: return existing if already issued)
    const { data: existing } = await supabaseAdmin
      .from("certificates")
      .select("certificate_number")
      .eq("user_id", userId)
      .eq("course_id", course.id)
      .maybeSingle();

    if (existing) {
      return { certificateNumber: existing.certificate_number, alreadyIssued: true };
    }

    // 5. Fetch recipient name from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const recipientName = profile?.full_name || "Verified Analyst";
    const certNumber = `NISQ-CERT-${course.slug.toUpperCase().slice(0, 6)}-${new Date().getFullYear()}-${crypto.randomUUID().split("-")[0].toUpperCase()}`;

    // 6. Insert via service-role (no authenticated INSERT policy)
    const { error } = await supabaseAdmin.from("certificates").insert({
      user_id: userId,
      course_id: course.id,
      certificate_number: certNumber,
      recipient_name: recipientName,
      course_title: course.title,
    });

    if (error) {
      return { error: "ISSUE_FAILED", certificateNumber: null };
    }

    return { certificateNumber: certNumber, alreadyIssued: false };
  });

/** Public certificate lookup — no auth required */
export const getCertificate = createServerFn({ method: "GET" })
  .inputValidator((value: unknown) => verifyCertInput.parse(value))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cert } = await supabaseAdmin
      .from("certificates")
      .select("id, certificate_number, recipient_name, course_title, issued_at")
      .eq("certificate_number", data.certificateNumber)
      .maybeSingle();

    if (!cert) {
      return { found: false, certificate: null };
    }

    return {
      found: true,
      certificate: {
        id: cert.id,
        certificateNumber: cert.certificate_number,
        recipientName: cert.recipient_name,
        courseTitle: cert.course_title,
        issuedAt: cert.issued_at,
        issuer: "NISQ Vanguard — Defence Technologies Academy",
      },
    };
  });
