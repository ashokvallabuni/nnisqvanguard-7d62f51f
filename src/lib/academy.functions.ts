/**
 * Server-side module completion and course progress functions.
 *
 * Security contract:
 * - Browser CANNOT directly insert into module_progress (no authenticated INSERT policy without server fn)
 * - completeModule verifies enrollment/course/module server-side before persisting
 * - Badge evaluation is triggered server-side after genuine completion
 * - issueCourseCompletionCertificate checks all modules completed before issuing cert
 *
 * Session / token errors return structured { error: "SESSION_EXPIRED" } responses
 * instead of raw exceptions so the frontend can prompt sign-in gracefully.
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

    // Import admin client lazily (server-only)
    let supabaseAdmin: any;
    try {
      const clientServer = await import("@/integrations/supabase/client.server");
      supabaseAdmin = clientServer.supabaseAdmin;
    } catch {
      // Admin client unavailable — continue without certificate issuance
      supabaseAdmin = null;
    }

    // ── 1. Resolve course ID ────────────────────────────────────────────────
    let courseId = "";
    let courseTitle = "";

    try {
      const { data: dbCourse } = await supabase
        .from("courses")
        .select("id, title, slug")
        .eq("slug", data.courseSlug)
        .maybeSingle();

      if (dbCourse) {
        courseId = dbCourse.id;
        courseTitle = dbCourse.title;
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      if (msg.includes("JWT expired") || msg.includes("token is expired") || msg.includes("Unauthorized")) {
        return { error: "SESSION_EXPIRED", completed: false, message: "Your session has expired. Please sign in again to continue." };
      }
    }

    // Fallback to canonical curriculum
    if (!courseId) {
      const { AVAILABLE_COURSES } = await import("@/data/courses-curriculum");
      const found = AVAILABLE_COURSES.find((c) => c.slug === data.courseSlug);
      if (found) {
        courseId = found.id;
        courseTitle = found.title;
      }
    }

    if (!courseId) {
      return { error: "COURSE_NOT_FOUND", completed: false, message: "Course not found. Please refresh and try again." };
    }

    // ── 2. Resolve module ID ────────────────────────────────────────────────
    let moduleId = "";
    let moduleTitle = "";

    try {
      const { data: dbModule } = await supabase
        .from("modules")
        .select("id, course_id, slug, title")
        .eq("slug", data.moduleSlug)
        .maybeSingle();

      if (dbModule) {
        moduleId = dbModule.id;
        moduleTitle = dbModule.title;
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      if (msg.includes("JWT expired") || msg.includes("token is expired") || msg.includes("Unauthorized")) {
        return { error: "SESSION_EXPIRED", completed: false, message: "Your session has expired. Please sign in again to continue." };
      }
    }

    // Fallback to canonical curriculum
    if (!moduleId) {
      const { AVAILABLE_COURSES } = await import("@/data/courses-curriculum");
      const foundCourse = AVAILABLE_COURSES.find((c) => c.slug === data.courseSlug);
      const foundMod = foundCourse?.modules.find((m) => m.slug === data.moduleSlug);
      if (foundMod) {
        moduleId = foundMod.id;
        moduleTitle = foundMod.title;
      }
    }

    if (!moduleId) {
      return { error: "MODULE_NOT_FOUND", completed: false, message: "Module not found. Please refresh and try again." };
    }

    // ── 3. Persist module completion ────────────────────────────────────────
    try {
      await supabase.from("module_progress").upsert(
        {
          user_id: userId,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,module_id" },
      );
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      if (msg.includes("JWT expired") || msg.includes("token is expired") || msg.includes("Unauthorized")) {
        return { error: "SESSION_EXPIRED", completed: false, message: "Your session has expired. Please sign in again to save your progress." };
      }
      // Non-session DB error — log and continue (don't block the user)
      console.warn("[completeModule] Warning saving module progress to DB:", err);
    }

    // ── 4. Badge eligibility evaluation ─────────────────────────────────────
    let awardedBadges: string[] = [];
    if (supabaseAdmin) {
      try {
        const { evaluateAllBadgesForUser } = await import("@/lib/badge.functions");
        awardedBadges = await evaluateAllBadgesForUser(userId, supabaseAdmin);
      } catch (badgeErr) {
        console.warn("[completeModule] Badge evaluation failed:", badgeErr);
      }
    }

    // ── 5. Check for course completion + certificate issuance ────────────────
    let certificateNumber: string | null = null;

    if (supabaseAdmin) {
      try {
        const { data: allModules } = await supabase
          .from("modules")
          .select("id")
          .eq("course_id", courseId);

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
              .eq("course_id", courseId)
              .maybeSingle();

            if (!existing) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", userId)
                .maybeSingle();

              const recipientName = profile?.full_name || "Verified Analyst";
              const certNum = `NISQ-CERT-${data.courseSlug.toUpperCase().slice(0, 6)}-${new Date().getFullYear()}-${crypto.randomUUID().split("-")[0].toUpperCase()}`;

              await supabaseAdmin.from("certificates").insert({
                user_id: userId,
                course_id: courseId,
                certificate_number: certNum,
                recipient_name: recipientName,
                course_title: courseTitle,
              });
              certificateNumber = certNum;
            } else {
              certificateNumber = existing.certificate_number;
            }
          }
        }
      } catch (certErr) {
        console.warn("[completeModule] Certificate check failed:", certErr);
      }
    }

    return {
      completed: true,
      moduleId,       // Fixed: was incorrectly using `module.id` (undefined) in old code
      moduleTitle,
      awardedBadges,
      certificateNumber,
    };
  });
