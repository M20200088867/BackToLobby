"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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

  // If not configured, start with isLoading: false
  const [state, setState] = useState<AuthState>(() => ({
    user: null,
    session: null,
    isLoading: configured,
  }));

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const fetchProfile = useCallback(
    async (supabaseUser: SupabaseUser): Promise<User | null> => {
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
    // Skip if not configured - initial state already has isLoading: false
    if (!configured) return;

    // Prevent running twice in strict mode
    if (initializedRef.current) return;
    initializedRef.current = true;

    mountedRef.current = true;
    const supabase = createClient();

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        setState((prev) => {
          if (prev.isLoading) {
            console.warn("Auth loading timeout - setting to not loading");
            return { ...prev, isLoading: false };
          }
          return prev;
        });
      }
    }, 5000);

    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mountedRef.current) return;

        if (error) {
          console.error("getSession error:", error);
          setState({ user: null, session: null, isLoading: false });
          return;
        }

        if (session?.user) {
          const profile = await fetchProfile(session.user);
          if (mountedRef.current) {
            setState({ user: profile, session, isLoading: false });
          }
        } else {
          setState({ user: null, session: null, isLoading: false });
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        if (mountedRef.current) {
          setState({ user: null, session: null, isLoading: false });
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      if (
        session?.user &&
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
      ) {
        const profile = await fetchProfile(session.user);
        if (mountedRef.current) {
          setState({ user: profile, session, isLoading: false });
        }
      } else if (event === "SIGNED_OUT") {
        setState({ user: null, session: null, isLoading: false });
      }
    });

    return () => {
      mountedRef.current = false;
      clearTimeout(timeout);
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

  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error: string | null }> => {
      if (!configured) return { error: "Supabase is not configured" };
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm`,
        },
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    },
    [configured]
  );

  const signInWithEmail = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error: string | null }> => {
      if (!configured) return { error: "Supabase is not configured" };
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    },
    [configured]
  );

  const signOut = useCallback(async (): Promise<{ error: string | null }> => {
    if (!configured) return { error: "Supabase is not configured" };
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error.message);
        return { error: error.message };
      }
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign out failed";
      console.error("Sign out error:", message);
      return { error: message };
    }
  }, [configured]);

  return {
    ...state,
    configured,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  };
}
