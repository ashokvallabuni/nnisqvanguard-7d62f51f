# NISQ Vanguard - Master Production Upgrade Implementation Plan (v2 — aligned with user AC-1..AC-44)

## Task 1: Favicon Consolidation & User-Facing Lovable Branding Removal
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - In `src/routes/__root.tsx` head links, keep only one primary `rel="icon"` with `href="/favicon.ico"` and one NISQ Vanguard apple-touch-icon; remove all other competing icon link variants (the 16x16.jpeg, 32x32.jpeg, png, nisq-logo.jpeg shortcuts, etc.).
  - Keep favicon.png / apple-touch-icon existing assets as fallback targets if referenced by apple-touch-icon only; ensure no duplicated primary declarations.
  - Search `src/routes/**/*.tsx` and `src/components/**/*.tsx` for any rendered UI string / title / description containing "Lovable" / "lovable.dev" / "lovable.app" and remove user-facing occurrences; keep the internal `integrations/lovable` helper and `lovable-error-reporting` code untouched.
  - Verify theme-color `#0ea5e9` remains in head meta.
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `rule` TR-1.1: `__root.tsx` head.links yields one primary icon + one apple-touch-icon only; primary icon href is `/favicon.ico`.
  - `rule` TR-1.2: Grep of routes/components user-facing strings returns zero matches for Lovable variants.
  - Evidence: Source inspection + grep output.

## Task 2: Team Roster & Founder Title Correction (Public Display)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - `src/routes/team.tsx`: filter/display only approved names (Ashok Vallabhuni, Varun Gajula, Sannith Reddy) with correct titles. If DB rows for Sai Tanaku or Pulijala Bhavani exist, exclude them via `.filter()` at render/query level.
  - `src/routes/about.founder.tsx`: title Founder · Chief Architect; no CEO string adjacent to Ashok.
  - Audit `/about.tsx`, `/team.tsx`, `/index.tsx`, `/login.tsx`, auth pages, footer, and any founder mention components; apply the same display filtering/titles.
  - `_authenticated/admin.team.tsx`: Admin team list may retain DB rows but should mark/show any removed-public rows correctly (admin can still delete/edit). Focus is public display filter.
  - Do not fabricate founder bio content.
- **Acceptance Criteria Addressed**: AC-4, AC-5, AC-6, AC-7, AC-8
- **Test Requirements**:
  - `rule` TR-2.1: `/team` lists exactly Ashok / Varun / Sannith with correct titles.
  - `rule` TR-2.2: No "Sai Tanaku", "Pulijala", "Bhavani", or Ashok+CEO regex matches in public route/component output.
  - Evidence: Source + DOM snapshots.

## Task 3: Global Navigation (Desktop) + Android Bottom Navigation
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Update `TopNav` in `src/routes/__root.tsx`:
    - Desktop mainNav: HOME `/`, ACADEMY `/academy`, CYBER LABS `/cyber-range/labs`, THREAT INTELLIGENCE `/intelligence`, SERVICES (map to most appropriate existing route, e.g. `/solutions` or `/innovation` or `/services`-closest existing; if no route exists, reuse `/solutions`), COMMUNITY (e.g. `/events`-closest existing; never create a new duplicate route).
    - Authenticated extras: PROGRESS (e.g. `/_authenticated/cyber-range.my-progress.tsx` or `/dashboard` section), CERTIFICATES (`/_authenticated/certificates.tsx` or `/achievements`), PROFILE (`/_authenticated/profile.tsx`).
    - Admin renders ADMIN CONSOLE (→ `/admin`).
  - Mobile (≤ ~768px): Implement a fixed bottom nav bar with HOME | ACADEMY | LABS | INTEL | PROFILE (5 items, 48px height, min 44px tap each, Lucide icons + short labels). For remaining secondary items (Services, Community, Admin, Certificates, etc.), keep an accessible drawer triggered from profile/menu toggle.
  - Ensure main body padding accommodates top + bottom fixed bars so content is never clipped under sticky nav.
- **Acceptance Criteria Addressed**: AC-9, AC-11, AC-12
- **Test Requirements**:
  - `rule` TR-3.1: Desktop nav has exactly HOME/ACADEMY/CYBER LABS/THREAT INTELLIGENCE/SERVICES/COMMUNITY with valid existing route targets.
  - `rule` TR-3.2: At ≤768px a bottom bar with the 5 items renders; each item ≥44px tap target; body padding prevents overlap.
  - `rubric` TR-3.3: Mobile usability 1-5; threshold ≥4.
  - Evidence: Screenshots at 1280px and 390px + computed styles.

## Task 4: HOME Escape Hatches (Every Major Area)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - Add clearly labelled HOME control (button/breadcrumb/PageHeader prop) to the following routes: Academy, Course detail (`learn.$slug`), Lesson (`_authenticated/learn.$slug.$moduleSlug`), Cyber Labs landing, Threat Intel, Community-equivalent page, Dashboard, Report Incident (`complaint`), Appointments-equivalent, Profile, Certificates.
  - Add HOME + BACK TO CYBER LABS controls to Lab Detail (`_authenticated/cyber-range.lab.$slug`).
  - Add EXIT LAB + BACK TO LAB controls in Lab Workspace (same slug route or inner workspace component).
  - Prefer reusing existing `PageHeader` breadcrumbs field; if missing add it.
- **Acceptance Criteria Addressed**: AC-10, AC-15, AC-16
- **Test Requirements**:
  - `rule` TR-4.1: Every listed route has a HOME control navigating to `/`.
  - `rule` TR-4.2: Lab Detail has BACK TO CYBER LABS; workspace has EXIT LAB / BACK TO LAB.
  - Evidence: Per-route source review.

## Task 5: Cyber Labs Landing — Command Center
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  - Rework `src/routes/cyber-range.labs.tsx`:
    - Header with HOME, title CYBER LABS, tagline "Train. Attack. Defend. Prove." (stylised tactical layout).
    - Stats row pulling only real DB values: AVAILABLE LABS (count published), IN PROGRESS (if authenticated: count lab_sessions RUNNING + lab_progress incomplete started), COMPLETED (if authenticated: count completed), LEARNING PATHS (from learning_paths data or closest existing).
    - Category chips: compute categories from all labs actual `category` field + include the standard possible set only if category content exists OR is explicitly COMING SOON. Render COMING SOON chips disabled for empty categories.
    - Keep existing search + difficulty filters; ensure accessible keyboard interaction.
  - Refactor `src/components/cyber-range/LabCard.tsx` to display: NAME, CATEGORY, DIFFICULTY, ESTIMATED TIME, SKILLS, STATUS badge, PROGRESS bar; CTA = START LAB / CONTINUE LAB / VIEW LAB / REVIEW LAB based on user session/progress.
  - Ensure no fake stats or fabricated labs.
- **Acceptance Criteria Addressed**: AC-13, AC-14
- **Test Requirements**:
  - `rule` TR-5.1: Stats row derived from Supabase queries; zero literal fake counts.
  - `rule` TR-5.2: Category chips exist; any chip with zero labs shows COMING SOON label in disabled style.
  - `rule` TR-5.3: Lab Card contains all 7 required fields and status-appropriate CTA label.
  - `rubric` TR-5.4: Command-center UX 1-5, threshold ≥4.
  - Evidence: Source + 1920px/390px snapshots.

## Task 6: Lab Detail & Workspace Structure (Mission Layout)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 5
- **Description**:
  - `_authenticated/cyber-range.lab.$slug.tsx` top: HOME + BACK TO CYBER LABS, then LAB NAME meta block (DIFFICULTY/TIME/CATEGORY/SKILLS).
  - Content sections in order: MISSION OBJECTIVE, WHAT YOU WILL LEARN, REQUIRED KNOWLEDGE, LAB ENVIRONMENT, TASKS, PROGRESS, VALIDATION, COMPLETION.
  - Workspace: preserve existing runner and terminal; lay out panels with section labels MISSION / TARGET / TERMINAL / TASKS / HINTS / PROGRESS / VALIDATION / LOGS. Mobile: use tabs/accordion.
  - If runner returns infrastructure error, show clearly labelled "LAB ENVIRONMENT UNAVAILABLE" panel (not a raw stack trace); keep existing error-code mapping dict and extend if missing codes.
  - Never simulate or fabricate terminal command output.
- **Acceptance Criteria Addressed**: AC-15, AC-16
- **Test Requirements**:
  - `rule` TR-6.1: All 8 content sections present on detail page.
  - `rule` TR-6.2: Workspace has panel labels and unavailability banner component in place.
  - Evidence: Source.

## Task 7: Academy Platform UX (Cards + Button Labels + Locking)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  - Refactor `academy.tsx` header and progress strip; course cards via `CourseCard.tsx`.
  - Course cards show: COURSE NAME, LEVEL, MODULE COUNT, PROGRESS (real percent), STATUS badge.
  - CTA labels strictly: START COURSE (new & accessible), CONTINUE (in progress), VIEW COURSE (completed + available), LOCKED / COMING SOON (disabled + state label) — never generic.
  - Approved beginner list: 1. Cybersecurity Foundations 2. Kali Linux Installation 3. Basics in Networking. These can show START.
  - Any other course: LOCKED / COMING SOON badge + disabled START action; detail view also blocks.
- **Acceptance Criteria Addressed**: AC-13, AC-17, AC-18
- **Test Requirements**:
  - `rule` TR-7.1: Course cards display all required fields.
  - `rule` TR-7.2: CTA label vocabulary matches the specified list per status; no generic Learn More.
  - `rule` TR-7.3: Only the 3 approved courses have START COURSE / VIEW COURSE active; others LOCKED/COMING SOON disabled.
  - Evidence: Academy snapshot (desktop + mobile).

## Task 8: Server-Side Course Locking + Direct URL/API Guards
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 7
- **Description**:
  - Audit locking: Do NOT rely on frontend-only button disable. Ensure:
    - `learn.$slug.tsx` loader/query: If course is LOCKED/COMING SOON for non-admin user → return a LOCKED view payload WITHOUT lesson/module content rows, quiz answer data, or markdown notes.
    - `_authenticated/learn.$slug.$moduleSlug.tsx` loader: Check course published state server-side; reject locked module slugs.
    - Server functions / API routes: lessons APIs (`api/lessons/*`), quiz APIs (`api/quiz/*`), progress save, any module content loader — must verify course publication state (Admin-published OR in the 3 hardcoded-but-source-of-truth canonical list only when DB returns PUBLISHED-equivalent flag).
    - Existing Admin toggle flips state and immediately propagates; no hardcoded list duplicated in 5+ files; centralize via existing DB course.status or Admin Console status field, plus the 3-course fallback only where required. Create a small helper to centralize "is this course accessible" predicate to avoid scattered hardcoding.
  - Ensure attempts to access locked courses/modules via direct URLs or direct API calls return no lesson content / quiz payloads (4xx or LOCKED payload).
- **Acceptance Criteria Addressed**: AC-19, AC-20, AC-21, AC-35
- **Test Requirements**:
  - `rule` TR-8.1: Attempt URL `/learn/<locked-slug>` → shows LOCKED UI; network response does not include module notes/quizzes.
  - `rule` TR-8.2: Attempt API `/api/lessons/<locked-slug>/<module>` → 4xx (or equivalent non-content payload); does not leak notes_md or quiz options/correct_option.
  - `rule` TR-8.3: Central accessibility predicate used (one single source of truth) across UI, loaders, APIs.
  - `rule` TR-8.4: Admin publish toggle works without code change.
  - Evidence: Network panels + admin toggle sequence.

## Task 9: Dynamic Assessment Engine (No Cyber Awareness Hardcoding)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 8
- **Description**:
  - Audit assessment verification: `src/routes/_authenticated/learn.$slug.$moduleSlug.tsx`, `src/lib/quiz.functions.ts`, `src/routes/api/quiz.$moduleId.ts`, any `checkAnswer` / `submitFlag` equivalents, and module completion flow.
  - Remove any conditional like `if course === "Cyber Awareness"` that gates verification or progress write. Replace with parametric identifiers: courseId, moduleId, lessonId (if applicable), quizId, questionId, selectedAnswer.
  - Flow enforcement on server: answer key retrieved from DB row; compare server-side; never trust client `correct_option` value passed in request body.
  - On submit: show VERIFYING ANSWER… loading state; button disabled. Result: success/fail UI with explanation (from DB explanation field).
  - Prevent duplicate submissions (debounce + idempotency key or attempt table constraint).
  - Trace completion: `completeModule` must be invoked with correct moduleId (no undefined var references); completion should only occur after assessment passes (or per existing lesson-complete rule, whichever exists).
- **Acceptance Criteria Addressed**: AC-22, AC-23, AC-24, AC-25, AC-31
- **Test Requirements**:
  - `rule` TR-9.1: Grep for Cyber Awareness in verification logic yields 0 hardcoded branching hits.
  - `rule` TR-9.2: Assessment works across at least two configured available courses (Cybersecurity Foundations and Basics in Networking) — success persists, failure does not mark correct.
  - `rule` TR-9.3: Complete module receives defined moduleId; undefined does not occur.
  - `rule` TR-9.4: Correct answer never comes from client payload field alone; server authoritative.
  - Evidence: Two-assessment-runs output (manual), plus code review.

## Task 10: Progress System — Real DB, Survives Refresh/Login
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 9
- **Description**:
  - In Academy cards, Dashboard, Course detail, and Cyber labs cards ensure progress numbers come only from Supabase rows (module_progress, lab_progress, existing badges/certificates logic).
  - Remove any literal fake progress percentages or counts (e.g. hardcoded 75).
  - Ensure `user_progress` persistence path includes writing completion after assessment (from T9) and reading it reliably on reload/login (via react-query keys including user id; invalidate properly after writes).
  - Refresh → logout → login cycle should return same progress state.
- **Acceptance Criteria Addressed**: AC-24, AC-25, AC-26
- **Test Requirements**:
  - `rule` TR-10.1: Progress calculations reference real query results from module/lab progress tables.
  - `rule` TR-10.2: State identical before/after refresh and before/after logout+login for the same user.
  - Evidence: Cycle test snapshots.

## Task 11: Report Incident — Bucket Not Found Root-Cause Fix & Text-Only Guarantee
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Root cause the "BUCKET NOT FOUND" by inspecting in order:
    1. `complaint.tsx` bucket name used in `storage.from(...)`.
    2. Supabase Storage actual bucket list via Supabase connection.
    3. RLS Storage policies on bucket.
    4. Auth requirements on upload.
  - If bucket genuinely does not exist: create/configure safely using a migration / documented setup — do not create duplicates.
  - Update `complaint.tsx`:
    - Text-only report path works ALWAYS (validation → auth → DB insert → success) even if attachment step fails.
    - Upload errors wrapped in try/catch; user sees friendly message: "Evidence upload is currently unavailable. Your report can still be submitted without an attachment."; then proceed to insert complaint.
    - Keep loading labels: SUBMITTING REPORT… / UPLOADING EVIDENCE… (with disable states).
    - Evidence bucket is RLS-protected; never make publicly writable.
  - Verify existing Admin Console complaint review continues to work; existing auth.
- **Acceptance Criteria Addressed**: AC-27, AC-28, AC-29, AC-34 (session-preserve)
- **Test Requirements**:
  - `rule` TR-11.1: No-attachment submission produces DB row with evidence_url nullable — success UI + reference ID shown.
  - `rule` TR-11.2: Simulated upload failure → user-safe message + still inserts row.
  - `rule` TR-11.3: Another user cannot read/write my evidence objects (403).
  - Evidence: Storage policy / DB row + simulated failure.

## Task 12: Threat Intelligence Dashboard + Honest Labels
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 4
- **Description**:
  - Rewrite `src/routes/intelligence.tsx` from placeholder BackendPage into dashboard sections: THREAT OVERVIEW, THREAT CATEGORIES, LATEST REPORTS, IOC INFORMATION, SEVERITY, RESEARCH, SECURITY ADVISORIES.
  - Pull data from existing Supabase tables (threats, threat_reports, advisories, etc.) or existing closest data sources via small typed queries. If no rows, panels labelled STATIC / RESEARCH / COMING SOON accurately; nowhere "LIVE" unless actual live feed source exists.
  - Mobile: single column stacked. Desktop: 2–3 column dashboard grid. Include HOME control.
  - Never fabricate threat data or pretend static data is live.
- **Acceptance Criteria Addressed**: AC-30
- **Test Requirements**:
  - `rule` TR-12.1: HOME present and functional.
  - `rule` TR-12.2: All section panels have labels (LIVE / RESEARCH / STATIC / COMING SOON) accurate to actual data source existence.
  - `rubric` TR-12.3: Dashboard feel 1-5; threshold ≥4.
  - Evidence: Source + 1280px/390px snapshots.

## Task 13: Loading States & User-Safe Error Mapping (Cross-Cutting)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 9, Task 11, Task 12
- **Description**:
  - Add / verify loading labels:
    - Academy: LOADING COURSE...
    - Labs landing: LOADING LABS...
    - Lab detail/workspace: LOADING LAB...
    - Assessment: VERIFYING ANSWER... / SAVING PROGRESS...
    - Report Incident: SUBMITTING REPORT... / UPLOADING EVIDENCE...
    - Threat Intel: LOADING INTELLIGENCE...
  - Error dictionaries for common codes: JWT expired → "Your session has expired. Sign in again to continue."; bucket-not-found → "Evidence upload is currently unavailable. Your report can still be submitted…"; PostgREST/500 generic → "Something went wrong. Please try again or return home."
  - Keep raw errors logged via console and `reportLovableError` only; user UI never shows raw strings.
- **Acceptance Criteria Addressed**: AC-31, AC-32
- **Test Requirements**:
  - `rule` TR-13.1: All 7 listed loading labels exist in their flows.
  - `rule` TR-13.2: In listed error scenarios, user text is safe; raw tech strings only in dev console.
  - Evidence: Code grep + scenario tests.

## Task 14: 404 SIGNAL LOST Upgrade
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - Replace/upgrade NotFoundComponent in `__root.tsx` with SIGNAL LOST / PAGE NOT FOUND tactical panel, include NISQ logo.
  - Buttons: RETURN HOME → `/`, OPEN ACADEMY → `/academy`, OPEN CYBER LABS → `/cyber-range/labs`.
  - Use clear action labels, not generic.
- **Acceptance Criteria Addressed**: AC-33
- **Test Requirements**:
  - `rule` TR-14.1: All 3 buttons present and route correctly.
  - `rule` TR-14.2: Headings contain "SIGNAL LOST" and "PAGE NOT FOUND".
  - Evidence: Snapshot.

## Task 15: Mobile Responsiveness (No Overflow, Tables/Cards, Fixed-Bar Padding)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3, Task 5, Task 7, Task 12
- **Description**:
  - Ensure grids 1-col ≤480px, 2-col tablet, 3-col desktop.
  - Wrap every `<table>` in `overflow-x-auto` wrapper, or convert critical tables to card rows on mobile.
  - Use existing drawer/sheet components for any wide desktop popups/dropdowns so they work by touch.
  - Ensure main element padding accounts for top nav height (64px+) + bottom nav height (48px+) so content never hidden under fixed bars at 320–430px.
  - Manually test 320, 360, 375, 390, 412, 430, 480px widths for body horizontal scroll; ensure 0.
- **Acceptance Criteria Addressed**: AC-11, AC-12
- **Test Requirements**:
  - `rule` TR-15.1: Tables have horizontal scroll wrappers.
  - `rubric` TR-15.2: Mobile robustness 1-5; threshold ≥4.
  - `rule` TR-15.3: body.scrollWidth <= innerWidth across all listed widths.
  - Evidence: Scroll measurements at 390px + 320px.

## Task 16: Accessibility & Keyboard Interaction Pass
- **Status**: `pending`
- **Priority**: low
- **Depends On**: Task 3, Task 5, Task 7, Task 12
- **Description**:
  - Semantic headings (single h1/page, h2-h3 hierarchy).
  - Icon-only buttons aria-label (mobile nav, Home/Back icons if icon-only).
  - Focus rings via Tailwind/shadcn defaults; never remove outline without a replacement.
  - Dropdowns via Radix have keyboard navigation already; ensure any new custom select/chip filter is keyboard operable.
- **Acceptance Criteria Addressed**: AC-12 (by touch-target overlap), indirectly AC-44 quality
- **Test Requirements**:
  - `rule` TR-16.1: Every new interactive element is focusable; icon-only buttons have aria-labels.
  - `rule` TR-16.2: Pages have ≤1 h1 each.

## Task 17: Security Attempts (Locked Bypass) + Credential Exposure Audit
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 8, Task 11
- **Description**:
  - Manually attempt to: access locked course via URL, locked module URL, locked lesson URL, direct API call (e.g. fetch lessons API) with locked IDs, attempt progress modification (e.g. POST to progress endpoint with another user id or fabricated score), attempt admin-only endpoints as non-admin.
  - Audit client code and built chunks for `SUPABASE_SERVICE_ROLE_KEY` or any private env var strings.
  - Verify no `ALTER TABLE ... DISABLE ROW LEVEL SECURITY`; confirm policies still present.
  - For each attempt, document expected server-side denial (4xx / blocked rows due to RLS).
- **Acceptance Criteria Addressed**: AC-19, AC-20, AC-35, AC-36, AC-37, AC-38
- **Test Requirements**:
  - `rule` TR-17.1: 5 listed bypass attempts all fail server-side.
  - `rule` TR-17.2: grep build/ for service role/env leak = 0 matches.
  - `rule` TR-17.3: RLS not disabled in any diff/migration.
  - `rule` TR-17.4: No new duplicate tables/APIs introduced.
  - Evidence: Attempts report.

## Task 18: Final Build + Runtime QA (Desktop + Mobile)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: All prior tasks
- **Description**:
  - Run `npm run lint`, `npx tsc --noEmit`, `npm run build`. Fix any new regressions introduced by this wave.
  - Runtime QA checklist: Home, Academy, Cybersecurity Foundations, Kali Linux Installation, Basics in Networking, Assessment submit, Lesson completion, Progress persists, Cyber Labs list, Lab Detail, Lab Workspace unavailability banner, Threat Intel dashboard, Report Incident (with/without attachment), Appointments-equivalent, Dashboard, Founder, Team, Login, Sign Up, Admin Console sanity.
  - Test desktop 1280/1440/1920px and mobile 360/390/430px widths.
  - Note console warnings; resolve any new ones introduced.
  - Document final concise implementation report per user section 42: (1) root causes, (2) files modified, (3–17) change areas, (18) test matrices, build/lint/typecheck results, runtime verification results.
- **Acceptance Criteria Addressed**: AC-39, AC-40, AC-41, AC-42, AC-43, AC-44
- **Test Requirements**:
  - `rule` TR-18.1: lint exit 0.
  - `rule` TR-18.2: tsc exit 0.
  - `rule` TR-18.3: build exit 0.
  - `rubric` TR-18.4: Runtime QA breadth 1-5; threshold ≥4.
  - `rule` TR-18.5: No regressions in existing feature smoke list.
  - `rubric` TR-18.6: Overall platform feel 1-5; threshold ≥4.
  - Evidence: Terminal outputs + QA notes + report draft.
