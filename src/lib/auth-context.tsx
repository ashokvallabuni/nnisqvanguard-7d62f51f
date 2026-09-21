import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

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

  const { error } = await supabase.from("profiles").upsert(profile, { onConflict: "id" });
  if (error) {
    console.error("Unable to create or update the authenticated profile", error);
    return null;
  }

  const { data, error: readError } = await supabase
    .from("profiles")
    .select("id,email,phone,full_name,avatar_url,organization,designation,college,bio,country,role")
    .eq("id", user.id)
    .maybeSingle();
  if (readError) {
    console.error("Unable to load the authenticated profile", readError);
    return null;
  }
  return (data as Profile | null) ?? null;
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
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    setProfile(await ensureUserProfile(currentUser));
  };

  useEffect(() => {
    let mounted = true;
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      void loadProfile(nextSession?.user ?? null);
    });

    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) console.error("Unable to restore the Supabase session", error);
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await loadProfile(data.session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
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
        getCurrentUser: async () => (await supabase.auth.getUser()).data.user,
        getSession: async () => (await supabase.auth.getSession()).data.session,
        refreshProfile: async () => {
          if (user) setProfile(await ensureUserProfile(user));
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
