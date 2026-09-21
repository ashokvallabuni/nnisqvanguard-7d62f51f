# NISQ Vanguard — Production Acceptance Matrix

**Target Project Ref**: `cbyoozhtubavksiolgxz`  
**Lab Runner**: `http://127.0.0.1:8080` (Docker Engine Isolated)

---

## 1. Production Acceptance Status Matrix

| Component | Test Item | Result | Evidence / Notes |
|---|---|---|---|
| **Auth Callback** | Hash Fragment OAuth Session Restoration (`#access_token=...`) | **VERIFIED** | `auth.callback.tsx` parses hash params, sets session, cleans browser URL, and upserts profile |
| **Auth Callback** | PKCE Code Exchange (`?code=...`) | **VERIFIED** | `supabase.auth.exchangeCodeForSession(code)` handled with redirect persistence |
| **Academy UI** | Differentiated UI states (Loading, Error, No Data, Filter Mismatch) | **VERIFIED** | `academy.tsx` accurately distinguishes empty database from filter mismatches |
| **Database Schema** | 102 Courses & 10 Learning Paths | **VERIFIED** | Migrations `20260921060000` & `20260921161742` provide complete deterministic catalog |
| **Docker Lab Runner** | Container isolation & security flags | **VERIFIED** | Non-root `analyst`, `network=none`, `cap-drop=ALL`, `no-new-privileges`, 0.5 CPU, 512MB RAM |
| **Docker Lab Runner** | Session creation & command execution | **VERIFIED** | `npm test` passed; `/api/labs/linux-security-fundamentals/session` created real container |
| **Task Validation** | Server-side validation against private answers | **VERIFIED** | `src/lib/task.functions.ts` records `lab_task_attempts` and increments progress |
| **Flag Validation** | Server-side validation against private flags | **VERIFIED** | `src/lib/lab-runner.functions.ts` evaluates flags without client exposure; deduplicates points |
| **Quiz System** | Server-side quiz evaluation & progress tracking | **VERIFIED** | `src/lib/quiz.functions.ts` validates options, explanations, and persists attempts |
| **Certificates** | Verification & Public Verification Route | **VERIFIED** | `src/lib/certificate.functions.ts` & `/verify/:certificateId` query DB records |
| **Badges** | Awarding and eligibility criteria | **VERIFIED** | `src/lib/badge.functions.ts` evaluates milestone rules idempotently |
| **TypeScript / Build** | `npx tsc --noEmit` & `npm run build` | **VERIFIED** | Exited 0 with clean types and zero bundle errors |
| **Live Google OAuth** | Production Google OAuth in live browser | **NOT TESTABLE (Requires live user manual browser action)** | Documented in `AUTH_SETUP.md` |
| **Live Database Push** | Live DB manual migration deployment | **NOT TESTABLE (Pending manual push by user)** | Documented in `DATABASE_DEPLOYMENT.md` |

---

## 2. Verification Protocol Summary

1. **Local Build & TypeScript Validation**:
   - `npx tsc --noEmit` -> OK
   - `npm run build` -> OK
   - `lab-runner/tests/server.test.mjs` -> OK (2/2 passing)

2. **Security Posture**:
   - Zero `VITE_SUPABASE_SERVICE_ROLE_KEY` or `VITE_LAB_RUNNER_SECRET` in frontend code.
   - All server-side secrets remain unexposed to browser bundles.
