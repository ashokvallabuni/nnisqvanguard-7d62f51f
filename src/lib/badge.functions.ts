/**
 * Server-side badge evaluation and awarding.
 *
 * Security contract:
 * - Browser CANNOT directly insert into user_badges (no INSERT RLS policy for authenticated)
 * - Badge awarding uses supabaseAdmin (service-role) server-side only
 * - Duplicate prevention via upsert on (user_id, badge_id) composite PK
 * - Browser receives only: { awarded, badgeName, alreadyHeld } — no DB internals
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ACADEMY_BADGES } from "@/lib/badge-engine";

const badgeEvalInput = z.object({
  badgeSlug: z.string().min(1),
});

export const evaluateBadge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => badgeEvalInput.parse(value))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const badge = ACADEMY_BADGES.find((b) => b.slug === data.badgeSlug);
    if (!badge) {
      return { awarded: false, alreadyHeld: false, badgeName: null, message: "Badge not found." };
    }

    // 1. Find badge record in DB (or create it via admin)
    let { data: dbBadge } = await supabaseAdmin
      .from("badges")
      .select("id")
      .eq("name", badge.name)
      .maybeSingle();

    if (!dbBadge) {
      const { data: newBadge } = await supabaseAdmin
        .from("badges")
        .insert({ name: badge.name, description: badge.description })
        .select("id")
        .single();
      dbBadge = newBadge;
    }

    if (!dbBadge) {
      return {
        awarded: false,
        alreadyHeld: false,
        badgeName: badge.name,
        message: "Badge record error.",
      };
    }

    // 2. Check if already awarded (composite PK user_id, badge_id)
    const { data: existing } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId)
      .eq("badge_id", dbBadge.id)
      .maybeSingle();

    if (existing) {
      return {
        awarded: false,
        alreadyHeld: true,
        badgeName: badge.name,
        message: "Already earned.",
      };
    }

    // 3. Evaluate genuine eligibility
    // Rule: at least 1 completed module OR 1 completed lab (configurable per badge)
    const { count: completedModules } = await supabase
      .from("module_progress")
      .select("module_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);

    const { count: completedLabs } = await supabase
      .from("lab_progress")
      .select("lab_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);

    const isEligible = (completedModules ?? 0) >= 1 || (completedLabs ?? 0) >= 1;

    if (!isEligible) {
      return {
        awarded: false,
        alreadyHeld: false,
        badgeName: badge.name,
        message: "Requirements not yet met.",
      };
    }

    // 4. Award badge via service-role (bypasses RLS) — idempotent upsert
    await supabaseAdmin
      .from("user_badges")
      .upsert(
        { user_id: userId, badge_id: dbBadge.id, awarded_at: new Date().toISOString() },
        { onConflict: "user_id,badge_id" },
      );

    return {
      awarded: true,
      alreadyHeld: false,
      badgeName: badge.name,
      message: `${badge.name} awarded!`,
    };
  });

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Evaluate all eligible badges for a user after a completion event.
 * Called server-side from lab/module completion handlers.
 */
export async function evaluateAllBadgesForUser(
  userId: string,
  supabaseAdmin: SupabaseClient<Database>,
): Promise<string[]> {
  const awarded: string[] = [];

  // Query current progress counts via admin client
  const [{ count: completedLabs }, { count: completedModules }] = await Promise.all([
    supabaseAdmin
      .from("lab_progress")
      .select("lab_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true),
    supabaseAdmin
      .from("module_progress")
      .select("module_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true),
  ]);

  // Simple rule: any completed lab or module earns the first applicable badge
  if ((completedLabs ?? 0) >= 1 || (completedModules ?? 0) >= 1) {
    for (const badge of ACADEMY_BADGES.slice(0, 3)) {
      let { data: dbBadge } = await supabaseAdmin
        .from("badges")
        .select("id")
        .eq("name", badge.name)
        .maybeSingle();

      if (!dbBadge) {
        const { data: newBadge } = await supabaseAdmin
          .from("badges")
          .insert({ name: badge.name, description: badge.description })
          .select("id")
          .single();
        dbBadge = newBadge;
      }

      if (!dbBadge) continue;

      const { data: existing } = await supabaseAdmin
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", userId)
        .eq("badge_id", dbBadge.id)
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin.from("user_badges").insert({
          user_id: userId,
          badge_id: dbBadge.id,
          awarded_at: new Date().toISOString(),
        });
        awarded.push(badge.name);
        break; // award one badge per event to avoid spamming
      }
    }
  }

  return awarded;
}
