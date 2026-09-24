import { supabase } from "@/integrations/supabase/client";
import { AVAILABLE_COURSES, LOCKED_COURSES } from "@/data/courses-curriculum";

export const APPROVED_BEGINNER_COURSE_SLUGS = [
  "cybersecurity-foundations",
  "kali-linux-installation",
  "basics-in-networking",
] as const;

export type ApprovedBeginnerSlug = (typeof APPROVED_BEGINNER_COURSE_SLUGS)[number];

export type CourseAccessDeniedReason =
  "locked" | "unpublished" | "requires_authentication" | "admin_only" | "unknown_course";

export type CourseAccessResult =
  | { ok: true; reason?: undefined }
  | { ok: false; reason: CourseAccessDeniedReason; message: string };

export type UserRoleLike = {
  isAdmin?: boolean;
  role?: string | null;
  id?: string | null;
};

const ADMIN_ROLE_TOKENS = new Set(["admin", "super_admin", "owner", "staff"]);

const PUBLIC_APPROVED_SET = new Set<string>(APPROVED_BEGINNER_COURSE_SLUGS as unknown as string[]);

const LOCKED_SLUG_SET = new Set<string>(LOCKED_COURSES.map((c) => c.slug));

function normalizeRole(user: UserRoleLike | undefined | null): {
  isAdmin: boolean;
  isAuthed: boolean;
} {
  if (!user) return { isAdmin: false, isAuthed: false };
  const isAdmin =
    !!user.isAdmin ||
    (typeof user.role === "string" && ADMIN_ROLE_TOKENS.has(user.role.toLowerCase()));
  const isAuthed = !!user.id;
  return { isAdmin, isAuthed };
}

function resultFromDbStatus(dbStatus: unknown): CourseAccessResult {
  const s = typeof dbStatus === "string" ? dbStatus.trim().toLowerCase() : "";
  if (s === "published" || s === "public" || s === "live") {
    return { ok: true };
  }
  if (s === "locked" || s === "archived") {
    return {
      ok: false,
      reason: "locked",
      message: "This course is currently LOCKED and scheduled for future release.",
    };
  }
  if (s === "draft" || s === "review" || s === "preparing" || s === "") {
    return {
      ok: false,
      reason: "unpublished",
      message: "This course is still in production and is not yet accessible.",
    };
  }
  return {
    ok: false,
    reason: "unpublished",
    message: "This course is not currently accessible.",
  };
}

export function isApprovedBeginnerSlug(slug: string): boolean {
  return PUBLIC_APPROVED_SET.has(slug);
}

export function isLockedComingSoonSlug(slug: string): boolean {
  return LOCKED_SLUG_SET.has(slug);
}

export function getApprovedBeginnerCoursesStatic() {
  const approved = AVAILABLE_COURSES.filter((c) => PUBLIC_APPROVED_SET.has(c.slug));
  if (approved.length > 0) return approved;
  return AVAILABLE_COURSES.filter(
    (c) =>
      c.slug === "cybersecurity-foundations" ||
      c.slug === "networking-fundamentals" ||
      c.slug === "linux-command-quest",
  ).slice(0, 3);
}

export function getLockedComingSoonCoursesStatic() {
  return LOCKED_COURSES.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    category: c.category,
    level: c.difficulty,
    duration_hours: parseInt(c.duration, 10) || undefined,
    summary: `${c.title} — advanced cybersecurity track. Currently in production under review by Chief Architect Ashok Vallabhuni.`,
    isLocked: true as const,
    comingSoon: true as const,
    tags: [c.category, c.difficulty, "Coming Soon"].filter(Boolean) as string[],
    module_count: 8,
    progress_percent: 0,
  }));
}

export async function isCourseAccessible(
  slug: string,
  opts?: { user?: UserRoleLike | null; requireAuth?: boolean },
): Promise<CourseAccessResult> {
  const { user, requireAuth = false } = opts ?? {};
  const { isAdmin, isAuthed } = normalizeRole(user);

  if (!slug) {
    return {
      ok: false,
      reason: "unknown_course",
      message: "Course identifier is missing.",
    };
  }

  if (requireAuth && !isAuthed && !isAdmin) {
    return {
      ok: false,
      reason: "requires_authentication",
      message: "Please sign in to access this course module.",
    };
  }

  if (isAdmin) {
    return { ok: true };
  }

  if (LOCKED_SLUG_SET.has(slug)) {
    return {
      ok: false,
      reason: "locked",
      message:
        "This course is marked COMING SOON. It is in production and under Chief Architect review.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("courses")
      .select("id, slug, tier, status")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.warn("[course-accessibility] courses query error:", error);
    }

    if (data) {
      const status = (data.status || "").trim().toLowerCase();
      if (status === "published" || status === "public" || status === "live") {
        return { ok: true };
      }
      return {
        ok: false,
        reason: "locked",
        message:
          "This course is currently LOCKED. It can only be made accessible when published from the Admin Console.",
      };
    }
  } catch (err) {
    console.warn("[course-accessibility] supabase query failed, fallback", err);
  }

  return {
    ok: false,
    reason: "locked",
    message: "This course is currently LOCKED. Only Admin Console publishing makes it accessible.",
  };
}

export async function getAccessibleCourseSlugs(opts?: {
  user?: UserRoleLike | null;
}): Promise<Set<string>> {
  const { user } = opts ?? {};
  const { isAdmin } = normalizeRole(user);
  const result = new Set<string>();

  if (isAdmin) {
    for (const c of AVAILABLE_COURSES) result.add(c.slug);
    for (const c of LOCKED_COURSES) result.add(c.slug);
  }

  try {
    const { data } = await supabase.from("courses").select("slug, status").limit(500);
    if (data) {
      for (const row of data) {
        const s = (row.status || "").trim().toLowerCase();
        if (isAdmin || s === "published" || s === "public" || s === "live") {
          result.add(row.slug);
        }
      }
    }
  } catch (err) {
    console.warn("[course-accessibility] bulk query skipped:", err);
  }

  return result;
}

export function describeAccessError(reason: CourseAccessDeniedReason): string {
  switch (reason) {
    case "locked":
      return "This course is currently LOCKED. Please explore the approved beginner tracks in the Academy.";
    case "unpublished":
      return "This course is not yet published. Check back soon.";
    case "requires_authentication":
      return "Please sign in to access course materials.";
    case "admin_only":
      return "This area is restricted to platform administrators.";
    case "unknown_course":
    default:
      return "The requested course track was not found.";
  }
}
