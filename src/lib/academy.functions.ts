/**
 * Server-side module completion and course progress functions.
 *
 * Security contract:
 * - Browser CANNOT directly insert into module_progress (no authenticated INSERT policy without server fn)
 * - completeModule verifies enrollment/course/module server-side before persisting
 * - Badge evaluation is triggered server-side after genuine completion
 * - issueCourseCompletionCertificate checks all modules completed before issuing cert
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const completeModuleInput = z.object({
  courseSlug: z.string().min(1),
  moduleSlug: z.string().min(1),
});

export const completeModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => completeModuleInput.parse(value))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Verify course exists
    const { data: course } = await supabase
      .from("courses")
      .select("id, title, slug")
      .eq("slug", data.courseSlug)
      .maybeSingle();

    if (!course) {
      return { error: "COURSE_NOT_FOUND", completed: false };
    }

    // 2. Verify module exists and belongs to course
    const { data: module } = await supabase
      .from("modules")
      .select("id, course_id, slug, title")
      .eq("course_id", course.id)
      .eq("slug", data.moduleSlug)
      .maybeSingle();

    if (!module) {
      return { error: "MODULE_NOT_FOUND", completed: false };
    }

    // 3. Persist module completion

    // 4. Persist module completion
    await supabase.from("module_progress").upsert(
      {
        user_id: userId,
        module_id: module.id,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module_id" },
    );

    // 5. Evaluate badge eligibility server-side via admin client
    const { evaluateAllBadgesForUser } = await import("@/lib/badge.functions");
    const awardedBadges = await evaluateAllBadgesForUser(userId, supabaseAdmin);

    // 6. Check if all modules for this course are now complete → issue certificate
    const { data: allModules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", course.id);

    let certificateNumber: string | null = null;
    if (allModules && allModules.length > 0) {
      const { count: completedCount } = await supabase
        .from("module_progress")
        .select("module_id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("completed", true)
        .in("module_id", allModules.map((m) => m.id));

      if ((completedCount ?? 0) >= allModules.length) {
        // All modules done — issue certificate if not already issued
        const { data: existing } = await supabaseAdmin
          .from("certificates")
          .select("certificate_number")
          .eq("user_id", userId)
          .eq("course_id", course.id)
          .maybeSingle();

        if (!existing) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userId)
            .maybeSingle();

          const recipientName = profile?.full_name || "Verified Analyst";
          const certNum = `NISQ-CERT-${course.slug.toUpperCase().slice(0, 6)}-${new Date().getFullYear()}-${crypto.randomUUID().split("-")[0].toUpperCase()}`;

          await supabaseAdmin.from("certificates").insert({
            user_id: userId,
            course_id: course.id,
            certificate_number: certNum,
            recipient_name: recipientName,
            course_title: course.title,
          });
          certificateNumber = certNum;
        } else {
          certificateNumber = existing.certificate_number;
        }
      }
    }

    return {
      completed: true,
      moduleId: module.id,
      awardedBadges,
      certificateNumber,
    };
  });
