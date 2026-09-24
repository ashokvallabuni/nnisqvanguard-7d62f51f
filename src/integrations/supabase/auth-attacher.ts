import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | undefined;
    try {
      // getSession() automatically refreshes if expired and autoRefreshToken is true.
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.warn("[attachSupabaseAuth] getSession error:", error);
      } else if (data.session) {
        token = data.session.access_token;

        // If session exists but near expiry, try manual refresh
        if (data.session.expires_at) {
          const expiresAt = data.session.expires_at * 1000;
          if (Date.now() > expiresAt - 60_000) {
            const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.warn(
                "[attachSupabaseAuth] Token near expiry and refresh failed:",
                refreshError,
              );
              token = undefined; // Do not send expired token
            } else if (refreshed.session?.access_token) {
              token = refreshed.session.access_token;
            } else {
              token = undefined; // Refresh succeeded but no token returned
            }
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
