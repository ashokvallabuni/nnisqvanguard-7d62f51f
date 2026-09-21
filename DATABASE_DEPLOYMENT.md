# NISQ Vanguard — Production Database Deployment Guide

**Target Project Ref**: `cbyoozhtubavksiolgxz`  
**Project URL**: `https://cbyoozhtubavksiolgxz.supabase.co`

---

## 1. Migration Order & Inventory

All migrations in `supabase/migrations/` are structured to be safe, idempotent, and deterministic.

| Order | Migration File | Description |
|---|---|---|
| 1 | `20260718133715_24c6b497-5c6c-40a1-acc5-1bb42a5f9460.sql` | Core schema initialization |
| 2 | `20260718133811_008a6bb4-6f8a-48ac-a4b5-2264eb77a0b6.sql` | Initial schema adjustments |
| 3 | `20260719011946_5e885460-aa19-41a8-80c2-02639dca265a.sql` | Additional core tables |
| 4 | `20260720131735_de6bc6cc-95ce-4c38-be3d-81f58c9bf856.sql` | Schema enhancements |
| 5 | `20260721073218_766a454c-bd0f-4f5d-9bf2-0efdb7b8a2ce.sql` | Minor constraints |
| 6 | `20260722000001_ai_agents_tables.sql` | AI agent telemetry & tables |
| 7 | `20260913043944_6a16e140-53ea-431b-888f-0a3dac1835b4.sql` | Telemetry tables |
| 8 | `20260913044007_e7cf9d2d-3f43-4637-bfc8-3d655c6b3c44.sql` | Indexing |
| 9 | `20260913044026_7bf66690-d81b-4865-8643-1e6f7143a3ce.sql` | Foreign key updates |
| 10 | `20260913044109_ba21eb9b-18a0-4418-835b-605a0a74efd5.sql` | RLS enhancements |
| 11 | `20260921000000_auth_profiles_roles.sql` | User profiles and role permissions |
| 12 | `20260921010000_campus_programs.sql` | Institutional campus program tables |
| 13 | `20260921020000_academy_learning_paths.sql` | Academy modules, quizzes, and assignments |
| 14 | `20260921030000_cyber_labs_dataset_platform.sql` | Cyber labs, datasets, and tasks |
| 15 | `20260921040000_cyber_lab_runtime.sql` | Cyber lab runtime sessions and progress |
| 16 | `20260921050000_linux_security_fundamentals.sql` | Linux Security Fundamentals lab content & flags |
| 17 | `20260921060000_seed_102_courses_curriculum.sql` | 102 Courses & 10 Learning Paths curriculum seed |
| 18 | `20260921161742_seed_all_102_courses.sql` | Extended 102 courses data |
| 19 | `20260922000000_progression_platform.sql` | Badges, certificates, and student progression |
| 20 | `20260922000001_slug_paths_flag_attempts.sql` | Slug-based path enrollments & flag attempts |
| 21 | `20260922000002_user_learning_paths_nullable_id.sql` | User learning paths nullable ID fix |

---

## 2. Exact Manual Push Commands

You can apply all migrations using the Supabase CLI:

```bash
# Push all migrations to target production project:
npx supabase db push --project-ref cbyoozhtubavksiolgxz
```

Or execute the SQL scripts sequentially inside the **Supabase SQL Editor** on `https://supabase.com/dashboard/project/cbyoozhtubavksiolgxz/sql`.

---

## 3. Database Verification

Run the verification script `scripts/verify-production-db.sql` in the Supabase SQL Editor to confirm table population and RLS posture.

### Expected Record Counts (After full seeding):
- **learning_paths**: 10
- **courses**: 102
- **modules**: 5+ (core starter paths)
- **labs**: 1+ (Linux Security Fundamentals and companion labs)
- **lab_tasks**: 5
- **lab_flags**: 2
- **badges**: 10
- **datasets**: 6+ (CIC-IDS2018, UNSW-NB15, auth.log, etc.)

---

## 4. RLS & Security Verification

All student progress tables (`module_progress`, `user_course_progress`, `lab_progress`, `lab_task_attempts`, `lab_flag_attempts`, `user_learning_paths`, `user_badges`, `certificates`) have RLS enabled with `auth.uid() = user_id` isolation.

`expected_answer` on `lab_tasks` and `flag_value` on `lab_flags` are shielded from client reads.
