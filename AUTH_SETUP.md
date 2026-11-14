# NISQ Vanguard — Production Google OAuth & Authentication Configuration

## 1. Supabase Project Details

- **Project Ref**: `cbyoozhtubavksiolgxz`
- **Project URL**: `https://cbyoozhtubavksiolgxz.supabase.co`

---

## 2. Distinction Between Callback URIs

### A. Google Cloud Console → Supabase Auth Broker

This is the **Authorized Redirect URI** configured inside the **Google Cloud Console (Credentials → OAuth 2.0 Client IDs)**:

```text
https://cbyoozhtubavksiolgxz.supabase.co/auth/v1/callback
```

> [!IMPORTANT]
> Do NOT set your frontend `/auth/callback` in Google Cloud Console. Google talks directly to the Supabase Auth server broker (`...supabase.co/auth/v1/callback`).

### B. Supabase Dashboard → Frontend Application Redirect

This is configured inside **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL**:
  ```text
  https://<your-vercel-domain>.vercel.app
  ```
- **Redirect URLs** (Add all of the following):
  ```text
  http://localhost:5173/auth/callback
  http://localhost:3000/auth/callback
  https://<your-vercel-domain>.vercel.app/auth/callback
  ```

---

## 3. Google Cloud Console Setup Step-by-Step

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Create or open an **OAuth 2.0 Client ID** (Application type: _Web application_).
3. **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://<your-vercel-domain>.vercel.app`
4. **Authorized redirect URIs**:
   - `https://cbyoozhtubavksiolgxz.supabase.co/auth/v1/callback`
5. Copy the **Client ID** and **Client Secret**.

---

## 4. Supabase Provider Configuration

1. In Supabase Dashboard for `cbyoozhtubavksiolgxz`:
2. Navigate to **Authentication** → **Providers** → **Google**.
3. Toggle Google to **Enabled**.
4. Paste the **Client ID** and **Client Secret** from Google Cloud.
5. Save changes.

---

## 5. Vercel & Local Environment Variables

### Frontend Environment Variables (Vercel & `.env.local`):

```bash
VITE_SUPABASE_URL=https://cbyoozhtubavksiolgxz.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-publishable-key-from-supabase-dashboard>
```

### Server / Lab Runner Environment Variables (Never add `VITE_` prefix):

```bash
SUPABASE_URL=https://cbyoozhtubavksiolgxz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-from-supabase-dashboard>
LAB_RUNNER_URL=http://127.0.0.1:8080
LAB_RUNNER_SECRET=<your-lab-runner-secret>
```

---

## 6. End-to-End Authentication Flow

```
1. User clicks "Continue with Google"
   ↓
2. Supabase SDK redirects to Google OAuth Consent screen
   ↓
3. Google validates credentials & redirects to:
   https://cbyoozhtubavksiolgxz.supabase.co/auth/v1/callback
   ↓
4. Supabase exchanges token and redirects user to:
   https://<your-app>/auth/callback#access_token=... (or ?code=...)
   ↓
5. /auth/callback restores Supabase session, strips tokens from URL
   ↓
6. ensureUserProfile(user) upserts record into public.profiles
   ↓
7. User is seamlessly redirected to /dashboard or their intended destination.
```
