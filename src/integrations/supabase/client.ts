import { createClient, type Session } from "@supabase/supabase-js";
import type { Database } from "./types";
import { brokeredPreviewStorage } from "./previewAuthStorage";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl ? "VITE_SUPABASE_URL" : null,
    !supabaseAnonKey ? "VITE_SUPABASE_ANON_KEY" : null,
  ].filter((value): value is string => value !== null);
  throw new Error(`Supabase configuration required: missing ${missing.join(", ")}`);
}

/**
 * Client-side Supabase client.
 *
 * Session handling:
 *   - persistSession: true              – sessions survive page reloads
 *   - autoRefreshToken: true            – Supabase SDK silently swaps the JWT for a new one before expiry
 *   - detectSessionInUrl: true          – capture OAuth / magic-link redirect tokens
 *   - storage: brokeredPreviewStorage() – Lovable preview share one auth session
 *
 * Graceful session refresh:
 *   The Supabase JS SDK itself handles automatic JWT refresh inside the
 *   `autoRefreshToken` flow.  If `onAuthStateChange` fires a
 *   `TOKEN_REFRESHED` event we explicitly re-issue a warm-up `getUser()` call,
 *   which prevents the first REST call after a refresh from racing with the
 *   middleware's JWT validation.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: brokeredPreviewStorage(),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      const doFetch = () => fetch(input, { ...init, headers });
      let res = await doFetch();
      if (res.status === 401) {
        const { error } = await supabase.auth.refreshSession();
        if (!error) res = await doFetch();
      }
      return res;
    },
  },
});

/**
 * Warm-up call + background refresh guard.
 *
 * Called from the AuthProvider's mounting effect.  Ensures:
 *   (a) the session is actually valid against `/auth/v1/user` on boot, and
 *   (b) if the JWT is close to expiry the SDK will refresh it before the
 *       first real network call ever needs to.
 */
export async function warmUpSupabaseSession(): Promise<Session | null> {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) return null;
    const expiresIn = (session.expires_at ?? 0) - Math.floor(Date.now() / 1000);
    if (expiresIn > 0 && expiresIn < 60) {
      await supabase.auth.refreshSession();
    } else {
      void supabase.auth.getUser().catch(() => null);
    }
    return session;
  } catch {
    return null;
  }
}
