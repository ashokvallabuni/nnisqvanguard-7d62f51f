import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase, warmUpSupabaseSession } from "@/lib/supabase";

export type Profile = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  organization: string | null;
  designation: string | null;
  college: string | null;
  bio: string | null;
  country: string | null;
  role: "user" | "admin";
};

export async function ensureUserProfile(user: User): Promise<Profile | null> {
  const metadata = user.user_metadata ?? {};
  const profile = {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    full_name: (metadata.full_name ?? metadata.name ?? null) as string | null,
    avatar_url: (metadata.avatar_url ?? metadata.picture ?? null) as string | null,
  };

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { error } = await supabase.from("profiles").upsert(profile, { onConflict: "id" });
      if (error) {
        lastError = error;
        if (error.code === "PGRST301" || /Invalid|JWT|token/i.test(error.message)) {
          const refreshed = await supabase.auth.refreshSession().catch(() => ({ error: true }));
          if (!refreshed.error) continue;
        }
        break;
      }
      const { data, error: readError } = await supabase
        .from("profiles")
        .select(
          "id,email,phone,full_name,avatar_url,organization,designation,college,bio,country,role",
        )
        .eq("id", user.id)
        .maybeSingle();
      if (readError) {
        lastError = readError;
        continue;
      }
      return (data as Profile | null) ?? null;
    } catch (err) {
      lastError = err;
    }
  }
  console.error("Unable to create or update the authenticated profile", lastError);
  return null;
}

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signInWithGoogle: (next?: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  getSession: () => Promise<Session | null>;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const loadProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const nextProfile = await ensureUserProfile(currentUser);
    if (mountedRef.current) setProfile(nextProfile);
  };

  useEffect(() => {
    mountedRef.current = true;
    let refreshTimer: number | undefined;

    const scheduleRefresh = (s: Session | null) => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      if (!s?.expires_at) return;
      const refreshMs = Math.max(
        30 * 1000,
        Math.min((s.expires_at * 1000 - Date.now()) / 2, 10 * 60 * 1000),
      );
      refreshTimer = window.setTimeout(() => {
        void supabase.auth.refreshSession().catch(() => null);
      }, refreshMs);
    };

    const handleAuthChange = async (event: AuthChangeEvent, nextSession: Session | null) => {
      if (!mountedRef.current) return;
      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }
      if (event === "TOKEN_REFRESHED") {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (!mountedRef.current) return;
          setSession(nextSession);
          setUser(userData.user ?? nextSession?.user ?? null);
          void loadProfile(userData.user ?? nextSession?.user ?? null);
          scheduleRefresh(nextSession);
          return;
        } catch {
          // Fall through and treat like SIGNED_IN
        }
      }
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      void loadProfile(nextSession?.user ?? null);
      scheduleRefresh(nextSession);
    };

    const { data: subscription } = supabase.auth.onAuthStateChange(handleAuthChange);

    void (async () => {
      const initial = await warmUpSupabaseSession();
      if (!mountedRef.current) return;
      setSession(initial);
      setUser(initial?.user ?? null);
      await loadProfile(initial?.user ?? null);
      scheduleRefresh(initial);
      if (mountedRef.current) setLoading(false);
    })();

    return () => {
      mountedRef.current = false;
      subscription.subscription.unsubscribe();
      if (refreshTimer) window.clearTimeout(refreshTimer);
    };
  }, []);

  const signInWithGoogle = async (next = "/dashboard") => {
    if (typeof window !== "undefined") sessionStorage.setItem("nisq:auth-next", next);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return error
      ? { error: new Error("Unable to complete authentication. Please try again.") }
      : {};
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: profile?.role === "admin",
        signInWithGoogle,
        signOut,
        getCurrentUser: async () => {
          const { data, error } = await supabase.auth.getUser();
          if (error) {
            const refreshed = await supabase.auth.refreshSession().catch(() => ({ error: true }));
            if (!refreshed.error) {
              return (await supabase.auth.getUser()).data.user ?? null;
            }
          }
          return data.user ?? null;
        },
        getSession: async () => {
          const { data } = await supabase.auth.getSession();
          return data.session ?? null;
        },
        refreshProfile: async () => {
          if (user) setProfile(await ensureUserProfile(user));
        },
        refreshSession: async () => {
          const { data } = await supabase.auth.refreshSession();
          return data.session ?? null;
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const context = useContext(Ctx);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
