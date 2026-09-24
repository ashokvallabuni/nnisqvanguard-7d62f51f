# NISQ Vanguard - Master Production Platform Upgrade (Spec v2 — aligned with user brief)

## Overview
- **Summary**: In-place, non-destructive upgrade of the existing NISQ Vanguard application into a production-ready cybersecurity platform (Academy + Cyber Labs / Cyber Range + Threat Intelligence + Security Services + Community + Admin Console). No rebuild. No replacement of working backend.
- **Purpose**: Replace brochure aesthetics with a command-center / cybersecurity-platform UX; fix root-cause issues in favicon, branding, team roster, navigation, mobile UX, course locking, dynamic assessments, report/storage bucket, progress persistence, error/loading states, and 404.
- **Target Users**: Students / Learners (mobile-first Android), College visitors, Administrators, General public.

## Goals
1. Every major area looks and behaves like a cybersecurity platform rather than a corporate brochure: command-center layouts, tactical panels, status indicators, no meaningless decorative visuals.
2. Android/mobile is first-class: 320–480px widths; 44–48px touch targets; bottom nav; no horizontal scroll; responsive tables/cards/dialogs.
3. Cyber Labs becomes a Cyber Operations / Training Command Center with real-data metrics, category chips, and status-rich lab cards.
4. Assessment engine is dynamic, server-side verified, and works for every properly configured course — not hardcoded to "Cyber Awareness"; progress and lesson/module completion persist.
5. Course locking is enforced server-side (Admin Console as single source of truth); only 3 approved beginner courses accessible; no direct-URL/API bypass.
6. Report Incident "BUCKET NOT FOUND" is resolved root-cause; text-only reports always submit; optional attachment failures do not block.
7. Team / Founder roster strictly matches the approved list; Ashok is never labelled CEO.
8. Favicon is `/favicon.ico` only; no user-facing Lovable starter branding.
9. Every button is action-labelled (START COURSE, CHECK ANSWER, EXIT LAB, …); every async path has loading + user-safe errors.
10. Branded 404 SIGNAL LOST; lint + typecheck + build pass; critical flows runtime-tested at desktop and mobile widths.

## Non-Goals
- Do NOT rebuild application from scratch.
- Do NOT replace working backend architecture, Supabase tables, or APIs.
- Do NOT duplicate existing routes, Supabase tables, or server functions.
- Do NOT disable RLS or expose service-role keys.
- Do NOT fabricate fake threats, fake terminal execution, fake statistics, fake progress, or fake labs.
- Do NOT create or modify the logo.
- Do NOT create a second home page.

## Background & Context (Verified Existing Architecture Audit Snapshot)
Frontend: TanStack Start/React Router v1 (file routes in `src/routes/`), React 19, Vite 8, Tailwind v4, Radix/shadcn ui components (`src/components/ui/`), Lucide icons, Sonner toasts, Vaul (mobile drawers), Recharts.
Auth/Supabase client: `src/integrations/supabase/client.ts` uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` fallback chain, brokered preview storage, `persistSession:true`, `autoRefreshToken:true`, 401→refresh→retry fetch wrapper. `src/lib/auth-context.tsx` schedules proactive refresh timers (30s–10m window) and `warmUpSupabaseSession` + `ensureUserProfile` with JWT retry loop; signInWithGoogle preserves `nisq:auth-next` return-to URL.
Server Supabase clients: `src/integrations/supabase/client.server.ts`, server functions under `src/lib/*.functions.ts`, API routes under `src/routes/api/*.ts`.
Database schema (migration chain): profiles/auth_roles, campus_programs, academy_learning_paths, cyber_labs_dataset_platform, cyber_lab_runtime, Linux security fundamentals, 102 curriculum seed, progression platform, slug_paths + flag_attempts, nullable learning path IDs, 20260924 `lessons_user_progress_seed_rls.sql` (lessons, quizzes, user_progress + RLS).
Course locking state in DB/Admin + fallback canonical `src/data/courses-curriculum.ts` (AVAILABLE_COURSES vs LOCKED_COURSES).
Approved accessible beginner courses: Cybersecurity Foundations, Kali Linux Installation, Basics in Networking (rest LOCKED/COMING SOON).
Approved public team (source of truth for this spec): Ashok Vallabhuni – Founder · Chief Architect; Varun Gajula – Co-Founder; Sannith Reddy – CPO · Product Marketer; exclude Sai Tanaku and Pulijala Bhavani CEO entirely from public views.
Storage: `complaint.tsx` uploads to `evidence` bucket; bucket-not-found currently surfaces raw error.
Cyber runner: separate `lab-runner/` package with Docker provider; canonical lab configs in `_authenticated/cyber-range.lab.$slug.tsx`; error-code mapping dict already present to be extended.
Threat Intel: currently placeholder `BackendPage` in `intelligence.tsx`.
Favicon in `__root.tsx`: duplicate icon link variants (32x32.jpeg, 16x16.jpeg, .png, nisq-logo.jpeg, /favicon.ico) — needs consolidation.

## Functional Requirements

### BR-1 Favicon & Lovable Starter Branding Removal
- FR-BR-1.1: Head links contain a single authoritative favicon: `href="/favicon.ico"`.
- FR-BR-1.2: apple-touch-icon uses an existing NISQ Vanguard asset; no Lovable icon references.
- FR-BR-1.3: User-facing UI text, titles, meta descriptions, and route head content contain no "Lovable / lovable.dev / lovable.app" strings. Internal helper modules/integrations are preserved.
- FR-BR-1.4: NISQ Vanguard logo asset is used consistently and never stretched/distorted.

### BR-2 Team Roster & Founder Titles
- FR-BR-2.1: `/team` and any other public team surfaces render exactly: Ashok Vallabhuni (Founder · Chief Architect), Varun Gajula (Co-Founder), Sannith Reddy (CPO · Product Marketer).
- FR-BR-2.2: Sai Tanaku does not appear in any public route/component.
- FR-BR-2.3: Pulijala Bhavani and any "CEO" label associated with her or with Ashok Vallabhuni do not appear in any public route/component.
- FR-BR-2.4: `/about/founder` prominently shows Ashok Vallabhuni, Founder · Chief Architect with existing photo and approved existing information only; no fabricated awards/governments/certifications.

### NAV-1 Global Navigation
- NAV-1.1: Desktop nav order: Logo → HOME, ACADEMY, CYBER LABS, THREAT INTELLIGENCE, SERVICES, COMMUNITY.
- NAV-1.2: Authenticated adds PROGRESS, CERTIFICATES, PROFILE.
- NAV-1.3: Admin renders ADMIN CONSOLE entry.
- NAV-1.4: No duplicate routes are created.

### NAV-2 Home Escape Route
- NAV-2.1: HOME button (or breadcrumb to `/`) present and functional in: Academy, Course detail, Lesson, Cyber Labs landing, Lab Detail, Lab Workspace, Threat Intelligence, Community-equivalent page, Dashboard, Reports/Complaint, Appointments, Profile, Certificates.
- NAV-2.2: Lab Detail has HOME + BACK TO CYBER LABS; Lab Workspace has EXIT LAB + BACK TO LAB.

### MOB-1 Android / Mobile-First
- MOB-1.1: No horizontal page overflow across 320, 360, 375, 390, 412, 430, 480px. Desktop widths 768, 1024, 1280, 1440, 1920px render cleanly.
- MOB-1.2: Primary mobile bottom nav (or drawer with equal reach): HOME | ACADEMY | LABS | INTEL | PROFILE; minimum 44–48px touch targets; no hover-only primary actions.
- MOB-1.3: Responsive typography, cards, grids; tables → horizontal scroll wrapper or stacked rows; dialogs/dropdowns mobile-friendly; sticky nav never covers content (main padding accounts for top+bottom bars).

### UI-1 Design Direction & Buttons
- UI-1.1: Visual direction: professional cybersecurity command-center; dark/clean panels, precise borders, subtle HUD, status indicators, controlled motion; no excessive neon/glow/rounded-SaaS/generic-hero or decorative animations.
- UI-1.2: Primary CTA labels use action vocabulary. Disallowed generic labels: CLICK HERE / GO / LEARN MORE / bare SUBMIT without context.
- UI-1.3: Every async button supports normal/loading/success/error/disabled states where applicable; loading disables duplicate clicks.

### LAB-1 Cyber Labs Command Center
- LAB-1.1: Cyber Labs landing header: CYBER LABS title + "Train. Attack. Defend. Prove." tagline; HOME present.
- LAB-1.2: Stats row uses ONLY real DB values (e.g., AVAILABLE LABS, IN PROGRESS [per user if authed], COMPLETED, LEARNING PATHS). Never hardcoded fake metrics.
- LAB-1.3: Category chips drawn from actual lab data (NETWORKING, LINUX, WEB SECURITY, ETHICAL HACKING, PHISHING DEFENCE, OSINT, DIGITAL FORENSICS, SOC, INCIDENT RESPONSE, PENETRATION TESTING, CLOUD SECURITY, MALWARE ANALYSIS); categories with zero content show COMING SOON chip; no fabricated labs.
- LAB-1.4: Each Lab Card renders: LAB NAME, CATEGORY, DIFFICULTY, ESTIMATED TIME, SKILLS, STATUS (AVAILABLE/IN PROGRESS/COMPLETED/LOCKED/COMING SOON), PROGRESS; CTA = START LAB / CONTINUE LAB / VIEW LAB / REVIEW LAB.

### LAB-2 Lab Detail & Workspace
- LAB-2.1: Lab Detail structure: HOME + BACK TO CYBER LABS → LAB NAME + DIFFICULTY/TIME/CATEGORY/SKILLS → MISSION OBJECTIVE, WHAT YOU WILL LEARN, REQUIRED KNOWLEDGE, LAB ENVIRONMENT, TASKS, PROGRESS, VALIDATION, COMPLETION sections.
- LAB-2.2: Workspace panels consistent with command-center style (MISSION/TARGET/TERMINAL/TASKS/HINTS/PROGRESS/VALIDATION/LOGS). No fake terminal execution; if backend unavailable display clear LAB ENVIRONMENT UNAVAILABLE state.
- LAB-2.3: Workspace always has EXIT LAB / BACK TO LAB navigations.

### ACA-1 Academy Platform
- ACA-1.1: Academy feels like an interactive learning platform: Learning Paths, Courses, Modules, Lessons, Assessments, Progress, Badges, Certificates.
- ACA-1.2: Course Cards display COURSE NAME / LEVEL / MODULE COUNT / PROGRESS / STATUS; CTAs START COURSE / CONTINUE / VIEW COURSE / LOCKED / COMING SOON.
- ACA-1.3: Locks and COMING SOON adhere to the 3-course approved list; Admin Console controls transitions.

### ACA-2 Course Access / Locking (Server-Side Enforcement)
- ACA-2.1: Public accessible list: 1) Cybersecurity Foundations 2) Kali Linux Installation 3) Basics in Networking. All others LOCKED/COMING SOON.
- ACA-2.2: Locked courses unreachable through navigation UI, direct URLs, module URLs, lesson URLs, and API requests. Server-side (Supabase RLS + server functions/route loaders) enforcement, not merely frontend hiding.
- ACA-2.3: Admin Console is the SINGLE SOURCE OF TRUTH for LOCKED ↔ PUBLISHED state. No duplicate hardcoded access-control lists scattered in multiple frontend components.
- ACA-2.4: If Admin publishes a course, users can enter it without code changes.

### ACA-3 Dynamic Assessment Verification & Persistence
- ACA-3.1: No hardcoded `if course === "Cyber Awareness"` or equivalent branching. Engine is parametric over {courseId, moduleId, lessonId, quizId, questionId, selectedAnswer}.
- ACA-3.2: Flow enforced: SELECT ANSWER → CHECK ANSWER → authenticated session → SERVER-SIDE verification against authoritative answer stored in DB → result → Supabase persistence → UI update → progress update. Never trust browser-supplied answer key.
- ACA-3.3: After correct verification, answer result, score (per existing logic), progress, lesson/module completion, and any badge/certificate triggers fire correctly per existing engine.
- ACA-3.4: Duplicate submissions prevented. Loading label: VERIFYING ANSWER… / SAVING PROGRESS…; failure yields clear error; no fabricated success.
- ACA-3.5: `completeModule` (or equivalent) receives the correct moduleId; undefined variable references fixed; completion does not happen before required validation.

### ACA-4 Progress (Real DB State)
- ACA-4.1: All progress figures (COURSE, MODULE, LAB, BADGES, CERTIFICATES) derive from real Supabase rows. No literal fake percentages/counts.
- ACA-4.2: Progress survives refresh, logout, login, and session restoration (because persistence is authoritative in DB).

### AUTH-1 Authentication Stability
- AUTH-1.1: Environment uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY; no SUPABASE_SERVICE_ROLE_KEY reaches browser JS bundle or rendered HTML.
- AUTH-1.2: Session expiry flow: (1) normal auto-refresh, (2) if refresh genuinely fails → route to Login preserving original destination via existing nisq:auth-next mechanism, (3) after login → return to destination.
- AUTH-1.3: No deletion of user progress during auth recovery.

### REP-1 Report Incident / Complaint (Bucket Fix)
- REP-1.1: Root cause of BUCKET NOT FOUND identified and addressed: inspect bucket name, from() calls, policies, auth, and create/configure safely via migration if genuinely missing (no duplicate buckets).
- REP-1.2: Attachments optional. TEXT-ONLY REPORTS ALWAYS SUCCEED (validation → auth → DB insert → success).
- REP-1.3: If attachment upload fails for any reason (bucket missing, auth, policy, network), user sees a safe message such as: "Evidence upload is currently unavailable. Your report can still be submitted without an attachment."; DB insert proceeds with evidence_url null.
- REP-1.4: RLS preserved: users cannot modify/view others' reports; non-anonymous upload (auth required); evidence bucket never public-writable. Admin review through existing Admin architecture.

### INT-1 Threat Intelligence Dashboard
- INT-1.1: Professional dashboard sections: THREAT OVERVIEW, THREAT CATEGORIES, LATEST REPORTS, IOC INFORMATION, SEVERITY, RESEARCH, SECURITY ADVISORIES.
- INT-1.2: Data rendered from actual sources; when not live, panels carry honest labels: LIVE / RESEARCH / STATIC / COMING SOON — never present static/demo data as live intelligence.

### ERR-1 Loading & Error States
- ERR-1.1: Important async ops have labelled loading: LOADING COURSE, LOADING LAB, VERIFYING ANSWER, SAVING PROGRESS, SUBMITTING REPORT, UPLOADING EVIDENCE, LOADING INTELLIGENCE.
- ERR-1.2: User-facing errors are human-readable with next-step guidance; raw tech strings (JWT expired, Bucket not found, 500, PostgREST) not shown to end-users; developer diagnostics retained in console and admin surfaces.
- ERR-1.3: 404 page displays SIGNAL LOST / PAGE NOT FOUND + three buttons: RETURN HOME, OPEN ACADEMY, OPEN CYBER LABS; uses NISQ branding and favicon.

### ACC-1 Accessibility & Performance
- ACC-1.1: Semantic HTML, keyboard nav, focus states, ARIA labels, accessible dropdowns/forms, contrast, screen-reader labels.
- ACC-1.2: Use existing framework capabilities (lazy load, code split, efficient queries); no new heavy animation libraries; no N+1 query regressions.

### SEC-1 Security & Data Integrity
- SEC-1.1: RLS enabled and preserved across courses, modules, progress, reports, labs, storage.
- SEC-1.2: Users cannot unlock courses, modify answer keys, modify others' progress/reports, admin-escalate, or reach locked routes via direct API calls.
- SEC-1.3: No duplicate tables, no dropped production data, no destructive schema changes without reversible migrations.

## Non-Functional Requirements
- NFR-1 Build: `eslint` clean, `tsc --noEmit` clean, `vite build` success; no new warnings introduced.
- NFR-2 Runtime: At desktop (1280/1440/1920px) and mobile (360–430px) widths, critical flows complete without errors.
- NFR-3 Runtime security: Attempts to access locked course URLs/modules/lessons and their APIs fail server-side with 4xx and return no protected content.
- NFR-4 Visual fidelity: Final site reads as a premium cybersecurity platform (AC-44 rubric), not a traditional scrolling corporate site.

## Constraints
- Technical: In-place only; existing TanStack Start + Supabase + Vite + Tailwind; preserve existing backend, existing routes, RLS, migrations, lab runner, auth.
- Business: Approved team list and approved beginner course list fixed; Admin Console source of truth; logo must not change; no fabrication.
- Dependencies: Existing Supabase env vars in Vercel; existing bucket/evidence naming; existing migrations/data.

## Assumptions
- If `team_members` DB rows still contain removed names, frontend display filtering (and optionally Admin team list filter) will hide them without deleting DB rows.
- If Supabase Storage `evidence` bucket genuinely does not exist, a safe migration/setup step is permitted; policies stay RLS-compliant.
- Threat intel content rows may be absent; UI degrades gracefully with COMING SOON / STATIC labels.

## Open Questions
- None. All requirements are explicitly specified by the user brief.

---

## Acceptance Criteria

### AC-1: Only /favicon.ico is used as the browser favicon
- **Type**: `rule`
- **Given**: Production HTML head
- **When**: App is built and inspected
- **Then**: Exactly one primary icon resolution through `/favicon.ico`; no competing duplicate `rel="icon"` links; apple-touch-icon points to an existing NISQ Vanguard asset.
- **Pass Condition**: `src/routes/__root.tsx` head.links yields one primary icon + one apple-touch-icon; no Lovable icon references.
- **Evidence**: Source inspection + build grep.

### AC-2: NISQ Vanguard logo consistently used
- **Type**: `rule`
- **Given**: All major pages
- **When**: Pages rendered
- **Then**: Logo asset used everywhere; nowhere stretched or replaced with generic shield.
- **Pass Condition**: Every header/founder/404/logo placement uses existing `nisq-logo` asset; no ad-hoc generic icons in place of logo where logo specified.
- **Evidence**: Per-page source grep.

### AC-3: No user-facing Lovable branding
- **Type**: `rule`
- **Given**: All routes/components that render visible UI text or head metadata
- **When**: Grep for "Lovable/lovable/lovable.dev/lovable.app"
- **Then**: Zero matches in user-facing UI strings, titles, descriptions, hero copy, buttons, 404, footer. Internal helper filenames/integrations remain.
- **Pass Condition**: Grepped files `src/routes/**/*.tsx`, `src/components/**/*.tsx` yield zero user-facing hits.
- **Evidence**: Grep report listing line matches (should be 0).

### AC-4: Public team is approved current team only
- **Type**: `rule`
- **Given**: `/team` and any team roster surfaces
- **When**: Rendered
- **Then**: Roster displays Ashok, Varun, Sannith only; no extra names.
- **Pass Condition**: Names rendered === approved set.
- **Evidence**: Source of `/team` route and components; runtime snapshot.

### AC-5: Ashok Vallabhuni labelled Founder · Chief Architect
- **Type**: `rule`
- **Given**: All public places Ashok name appears
- **When**: UI rendered
- **Then**: Title is Founder · Chief Architect; never CEO.
- **Pass Condition**: Grep `Ashok.*CEO|CEO.*Ashok` in public routes/components: zero hits.
- **Evidence**: Grep + `/about/founder` snapshot.

### AC-6: Sannith Reddy labelled CPO · Product Marketer
- **Type**: `rule`
- **Given**: Public team roster
- **When**: Rendered
- **Then**: Title is CPO · Product Marketer.
- **Pass Condition**: Title string matches.
- **Evidence**: `/team` snapshot.

### AC-7: Sai Tanaku removed from public website
- **Type**: `rule`
- **Given**: Public routes/components
- **When**: Grep + render
- **Then**: No Sai Tanaku name anywhere on public routes.
- **Pass Condition**: 0 hits in user-facing TSX for "Sai Tanaku" / "Sai".
- **Evidence**: Grep report.

### AC-8: Pulijala Bhavani CEO info removed from public website
- **Type**: `rule`
- **Given**: Public routes/components
- **When**: Grep + render
- **Then**: No Pulijala Bhavani name and no adjacent "CEO" label anywhere on public routes.
- **Pass Condition**: 0 hits for "Pulijala" / "Bhavani" in public routes.
- **Evidence**: Grep report.

### AC-9: Desktop navigation works correctly
- **Type**: `rule`
- **Given**: ≥1024px viewport
- **When**: User navigates
- **Then**: Top nav shows HOME, ACADEMY, CYBER LABS, THREAT INTELLIGENCE, SERVICES, COMMUNITY (and authed/admin extras where applicable). Every link resolves to an existing route; no 404 from nav.
- **Pass Condition**: Nav items map to existing routes under `src/routes/`.
- **Evidence**: Source of TopNav in `__root.tsx`.

### AC-10: Every major area has a working Home escape route
- **Type**: `rule`
- **Given**: Each major area page
- **When**: Page rendered
- **Then**: Working HOME button or breadcrumb → `/`.
- **Pass Condition**: All listed areas contain a HOME control with `to="/"` or equivalent.
- **Evidence**: Per-route source.

### AC-11: Android/mobile layouts without horizontal overflow
- **Type**: `rubric`
- **Dimension**: Mobile layout robustness at widths 320–480px
- **Scale**: 1-5
- **Anchors**: 1 = horizontal scroll present, clipped cards; 3 = mostly OK with small overflow in one view; 5 = zero horizontal overflow across all listed widths, tables wrapped, grids collapse to 1-col, padding accounts for fixed bars.
- **Pass Threshold**: >=4
- **Evidence**: Browser snapshots + body.scrollWidth <= innerWidth measurements.

### AC-12: Touch targets are appropriate
- **Type**: `rule`
- **Given**: Mobile bottom nav + primary CTAs
- **When**: Measured
- **Then**: Minimum ~44–48px touch targets on major interactive controls; overlap free.
- **Pass Condition**: Bottom bar ≥48px tall; each nav cell 44+ px.
- **Evidence**: DOM snapshot computed styles.

### AC-13: Primary buttons use clear action labels
- **Type**: `rule`
- **Given**: Primary CTAs across Academy, Labs, Learning, Assessment, Report, Auth, 404
- **When**: UI audited
- **Then**: No "Click Here/Go/Learn More/bare SUBMIT". All CTAs match action-labelled vocabulary list from section 9.
- **Pass Condition**: Grep for forbidden labels in button children returns 0 hits across the important files.
- **Evidence**: Grep report.

### AC-14: Cyber Labs has a command-center experience
- **Type**: `rubric`
- **Dimension**: Cyber Labs landing UX feels like a Cyber Operations / Training Command Center
- **Scale**: 1-5
- **Anchors**: 1 = plain card list; 3 = filter + header only; 5 = HOME, header tagline, real-data stats row, category chips with COMING SOON, status-rich cards with progress, responsive.
- **Pass Threshold**: >=4
- **Evidence**: Source of `cyber-range.labs.tsx` + snapshots at 1920px and 390px.

### AC-15: Lab details provide Home and Back to Labs
- **Type**: `rule`
- **Given**: Lab Detail route
- **When**: Rendered
- **Then**: Two navigation controls present: HOME and BACK TO CYBER LABS, functional.
- **Pass Condition**: Both controls route correctly.
- **Evidence**: Source + route test.

### AC-16: Lab workspace provides safe exit
- **Type**: `rule`
- **Given**: Lab Workspace
- **When**: Rendered
- **Then**: EXIT LAB and BACK TO LAB controls present; user never trapped.
- **Pass Condition**: Controls exist; routes resolve.
- **Evidence**: Source.

### AC-17: Only approved beginner courses accessible
- **Type**: `rule`
- **Given**: Any non-admin user
- **When**: Attempting to start/view a non-approved course
- **Then**: Only 3 approved courses show START COURSE / VIEW COURSE; others show LOCKED / COMING SOON.
- **Pass Condition**: UI + data layer restrict to approved set.
- **Evidence**: Academy snapshot + code review of locking.

### AC-18: Other courses show Locked / Coming Soon
- **Type**: `rule`
- **Given**: Non-approved course
- **When**: In listings and detail pages
- **Then**: LOCKED / COMING SOON badge and disabled START button state (or CTA label says so); no accessible START action.
- **Pass Condition**: Every non-approved course has that state.
- **Evidence**: Detail page for locked course snapshot.

### AC-19: Locked courses cannot be bypassed through direct URLs
- **Type**: `rule`
- **Given**: Locked course slug
- **When**: A non-admin user navigates directly to `/learn/<locked-slug>` or `/learn/<locked-slug>/<module>`
- **Then**: Route loader or guard blocks server-side; user shown LOCKED / COMING SOON view with no lesson content, quizzes, or answer payloads.
- **Pass Condition**: Protected content not rendered; response verified.
- **Evidence**: Manual URL attempt + network panel inspection.

### AC-20: Locked courses cannot be bypassed through direct API requests
- **Type**: `rule`
- **Given**: Locked course/module ids
- **When**: Calling API routes directly (e.g., `/api/lessons/$slug/$moduleSlug`, `/api/quiz/$moduleId`, any server loader)
- **Then**: Server returns 4xx without lesson notes / answer keys / quiz payloads.
- **Pass Condition**: Raw HTTP responses 4xx; no sensitive content in JSON.
- **Evidence**: Manual curl/fetch attempt output.

### AC-21: Admin Console controls course publication state
- **Type**: `rule`
- **Given**: Admin
- **When**: Toggling LOCKED → PUBLISHED (or reverse) in existing Admin course management UI
- **Then**: New state immediately reflected on frontend; no frontend redeploy required; no other files need edits.
- **Pass Condition**: Admin toggle changes are reflected in Academy + course guard.
- **Evidence**: Admin Console flow snapshot, then Academy update.

### AC-22: Assessment works for every properly configured course
- **Type**: `rule`
- **Given**: Any configured course with quizzes
- **When**: User answers a quiz question and submits
- **Then**: Verification succeeds or fails based on the course's own quiz data; results shown, progress updated.
- **Pass Condition**: Works across multiple courses; no code branching on a single course name.
- **Evidence**: Manual flows on ≥2 configured courses (Cybersecurity Foundations and Basics in Networking as available candidates).

### AC-23: Assessment NOT hardcoded to Cyber Awareness
- **Type**: `rule`
- **Given**: Assessment engine code
- **When**: Grep for "Cyber Awareness" / "cyber-awareness" conditional
- **Then**: Zero hardcoded access-control / verification forks on that course name.
- **Pass Condition**: Grep returns zero matches in verification logic.
- **Evidence**: Code grep + review.

### AC-24: Assessment results persisted to Supabase
- **Type**: `rule`
- **Given**: Correct answer submitted
- **When**: Flow complete
- **Then**: Answer result + score saved in relevant progress/quiz_attempt/flag tables using existing persistence paths.
- **Pass Condition**: Supabase rows appear after submission; confirmed via DB query or existing progress UI.
- **Evidence**: Submission + DB inspection.

### AC-25: Lesson/module completion persisted
- **Type**: `rule`
- **Given**: A user completes required assessment
- **When**: Completion gate is met
- **Then**: `completeModule` equivalent invoked with correct moduleId; completion state written to DB.
- **Pass Condition**: Progress UI updates; refresh restores completion state.
- **Evidence**: Before/after state + refresh.

### AC-26: Progress survives refresh and login/logout
- **Type**: `rule`
- **Given**: Partial progress user
- **When**: Refresh; logout; login; session restored
- **Then**: Progress numbers identical.
- **Pass Condition**: DB numbers === rendered numbers post-refresh and post-login.
- **Evidence**: Snapshot sequence.

### AC-27: Report Incident works without attachment
- **Type**: `rule`
- **Given**: Required fields filled; no file attached
- **When**: Submit
- **Then**: Complaint row inserts; reference ID shown; never fails because evidence upload skipped.
- **Pass Condition**: Row exists in Supabase `complaints` with evidence_url nullable or null.
- **Evidence**: Submission + DB row.

### AC-28: Storage bucket configured correctly
- **Type**: `rule`
- **Given**: Valid attachment + authed user
- **When**: Upload
- **Then**: File lands in correct bucket/object; URL persists; no "bucket not found".
- **Pass Condition**: Storage upload success; object retrievable (permissions preserved).
- **Evidence**: Upload network request success + storage object listing.

### AC-29: Storage policies remain secure
- **Type**: `rule`
- **Given**: Unauthenticated or mismatched-user context
- **When**: Attempt upload or read of another user's evidence
- **Then**: RLS/policy blocks.
- **Pass Condition**: Attempts return 403.
- **Evidence**: Policy or manual 403 response.

### AC-30: Threat Intel does not fabricate live info
- **Type**: `rule`
- **Given**: `/intelligence`
- **When**: Rendered
- **Then**: Every section carries LIVE / RESEARCH / STATIC / COMING SOON labels accurate to source.
- **Pass Condition**: Grep for COMING SOON / STATIC / RESEARCH / LIVE in intel route output.
- **Evidence**: `intelligence.tsx` + snapshot.

### AC-31: Loading states exist for important async ops
- **Type**: `rule`
- **Given**: Every listed async op
- **When**: In-flight
- **Then**: UI shows labelled loading state; button disabled to prevent double-submit.
- **Pass Condition**: Each of LOADING COURSE / LOADING LAB / VERIFYING ANSWER / SAVING PROGRESS / SUBMITTING REPORT / UPLOADING EVIDENCE / LOADING INTELLIGENCE labels present in their respective flows.
- **Evidence**: Code grep + runtime screenshots.

### AC-32: Errors user-friendly + dev diagnostics retained
- **Type**: `rule`
- **Given**: Failure paths
- **When**: Error caught
- **Then**: User message friendly (e.g., "Your session has expired. Sign in again to continue.", "Evidence upload is currently unavailable…"); raw error strings logged but not rendered.
- **Pass Condition**: No raw JWT/Bucket/PostgREST/500 strings in user-visible paragraphs.
- **Evidence**: Route code review + error dictionary grep.

### AC-33: Branded SIGNAL LOST 404 works
- **Type**: `rule`
- **Given**: Unknown route
- **When**: NotFound renders
- **Then**: SIGNAL LOST / PAGE NOT FOUND; RETURN HOME + OPEN ACADEMY + OPEN CYBER LABS buttons functional.
- **Pass Condition**: All three buttons navigate.
- **Evidence**: Snapshot + manual clicks.

### AC-34: Authentication and session refresh work
- **Type**: `rule`
- **Given**: Active session near expiry
- **When**: Timer approaches
- **Then**: Refresh attempt happens; if it succeeds → seamless; if fails → route to Login with return-to preserved, then login → return to destination.
- **Pass Condition**: Source shows refresh scheduling + next-page preserve + return logic.
- **Evidence**: `auth-context.tsx` + client.ts review.

### AC-35: RLS remains enabled
- **Type**: `rule`
- **Given**: All migrations and RLS-related code
- **When**: Grep for `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` or `drop policy`
- **Then**: Zero occurrences of disabling that would weaken protections.
- **Pass Condition**: No new code disables RLS.
- **Evidence**: Migration + lib code grep.

### AC-36: Service-role credentials not exposed
- **Type**: `rule`
- **Given**: Client bundle sources and HTML
- **When**: Grep / build output scan
- **Then**: No SUPABASE_SERVICE_ROLE_KEY or private env vars in client-accessible JS/HTML.
- **Pass Condition**: 0 matches.
- **Evidence**: Build chunk grep.

### AC-37: Existing database architecture preserved
- **Type**: `rule`
- **Given**: Existing tables
- **When**: Reviewing migrations and code
- **Then**: No production table drops; no duplicate courses/modules/labs tables created.
- **Pass Condition**: New migrations (if any) contain only additive, reversible, non-destructive changes preserving existing data.
- **Evidence**: Migration files diff.

### AC-38: No duplicate APIs or tables created
- **Type**: `rule`
- **Given**: Final codebase
- **When**: Cross-referenced with existing APIs and tables
- **Then**: No new parallel server functions / routes / tables that duplicate existing ones.
- **Pass Condition**: Code review confirms reuse.
- **Evidence**: File list + function list delta.

### AC-39: lint passes
- **Type**: `rule`
- **Given**: Clean checkout
- **When**: `npm run lint`
- **Then**: Exit code 0.
- **Pass Condition**: Terminal output exit 0.
- **Evidence**: Terminal output captured.

### AC-40: typecheck passes
- **Type**: `rule`
- **Given**: Clean checkout
- **When**: `npx tsc --noEmit`
- **Then**: Exit code 0.
- **Pass Condition**: No TypeScript errors.
- **Evidence**: Terminal output captured.

### AC-41: build passes
- **Type**: `rule`
- **Given**: Clean checkout
- **When**: `npm run build`
- **Then**: Exit code 0.
- **Pass Condition**: Build artifacts produced.
- **Evidence**: Terminal output captured.

### AC-42: Critical runtime flows tested
- **Type**: `rubric`
- **Dimension**: Breadth and depth of runtime QA performed
- **Scale**: 1-5
- **Anchors**: 1 = build-only, no runtime testing; 3 = a few flows tested; 5 = every listed flow (Home, Academy, 3 courses, Assessment, Lesson Completion, Progress, Cyber Labs, Lab Detail/Workspace, Threat Intel, Report Incident, Appointments, Dashboard, Founder, Team, Login, Sign Up, Admin Console) tested at desktop and mobile widths.
- **Pass Threshold**: >=4
- **Evidence**: QA notes per flow.

### AC-43: No unrelated functionality broken
- **Type**: `rule`
- **Given**: Existing features (auth, academy progress, admin, reports, appointments, badges, certs, labs, storage, routing)
- **When**: Smoke tested
- **Then**: No new regressions.
- **Pass Condition**: Smoke tests of each area pass.
- **Evidence**: Smoke-test checklist.

### AC-44: Site feels like a cybersecurity platform (not brochure)
- **Type**: `rubric`
- **Dimension**: Overall product feel — platform vs brochure
- **Scale**: 1-5
- **Anchors**: 1 = long-scroll hero + generic cards + neon overload; 3 = mixed brochure/platform; 5 = home/labs/academy/intel all read as cohesive tactical command-center dashboards with purpose-driven panels, status indicators, clear hierarchy, minimal decoration.
- **Pass Threshold**: >=4
- **Evidence**: Reviewer scoring with snapshots.
