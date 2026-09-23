import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | undefined;
    try {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
      
      // If session exists but near expiry (or to ensure freshest valid JWT)
      if (data.session && data.session.expires_at) {
        const expiresAt = data.session.expires_at * 1000;
        if (Date.now() > expiresAt - 60_000) {
          const { data: refreshed } = await supabase.auth.refreshSession();
          if (refreshed.session?.access_token) {
            token = refreshed.session.access_token;
          }
        }
      }
    } catch (err) {
      console.warn("[attachSupabaseAuth] Could not retrieve session:", err);
    }

    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);

