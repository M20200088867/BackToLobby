"use client";

import { useEffect, useState, useCallback } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export function useAuth() {
  const configured = isSupabaseConfigured();

  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: configured,
  });

  const fetchProfile = useCallback(
    async (supabaseUser: SupabaseUser) => {
      if (!configured) return null;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", supabaseUser.id)
          .single();
        if (error) {
          console.error("Failed to fetch user profile:", error.message);
          return null;
        }
        return data as User | null;
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        return null;
      }
    },
    [configured]
  );

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setState({ user: profile, session, isLoading: false });
      } else {
        setState({ user: null, session: null, isLoading: false });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        session?.user &&
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
      ) {
        const profile = await fetchProfile(session.user);
        setState({ user: profile, session, isLoading: false });
      } else if (event === "SIGNED_OUT") {
        setState({ user: null, session: null, isLoading: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured, fetchProfile]);

  const signInWithGoogle = useCallback(async () => {
    if (!configured) return;
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  }, [configured]);

  const signOut = useCallback(async () => {
    if (!configured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
  }, [configured]);

  return {
    ...state,
    configured,
    signInWithGoogle,
    signOut,
  };
}
