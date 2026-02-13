"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type {
  AuthChangeEvent,
  Session,
  User as SupabaseUser,
} from "@supabase/supabase-js";
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

  const [state, setState] = useState<AuthState>(() => ({
    user: null,
    session: null,
    isLoading: configured,
  }));

  // Guard against duplicate createProfile calls from concurrent events
  const profileCreatingRef = useRef(false);

  const createProfile = useCallback(
    async (supabaseUser: SupabaseUser): Promise<User | null> => {
      if (!configured) return null;

      // If another createProfile is in progress, wait then fetch
      if (profileCreatingRef.current) {
        for (let i = 0; i < 25; i++) {
          await new Promise((r) => setTimeout(r, 200));
          if (!profileCreatingRef.current) break;
        }
        try {
          const supabase = createClient();
          const { data } = await supabase
            .from("users")
            .select("*")
            .eq("id", supabaseUser.id)
            .single();
          return data as User | null;
        } catch {
          return null;
        }
      }

      profileCreatingRef.current = true;
      try {
        const supabase = createClient();
        const email = supabaseUser.email || "";
        const metadata = supabaseUser.user_metadata;

        let username =
          metadata?.name?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
          email.split("@")[0]?.replace(/[^a-z0-9]/g, "") ||
          `user${Date.now()}`;

        // Ensure uniqueness
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("username", username)
          .single();

        if (existing) {
          username = `${username}${Math.floor(Math.random() * 10000)}`;
        }

        const { data, error } = await supabase
          .from("users")
          .insert({
            id: supabaseUser.id,
            username,
            avatar_url: metadata?.avatar_url || metadata?.picture || null,
            bio: null,
            steam_id: null,
            psn_id: null,
            xbox_id: null,
          })
          .select("*")
          .single();

        if (error) {
          // Unique violation — profile was already created by another path
          // (e.g., the server-side callback route)
          if (error.code === "23505") {
            const { data: existingProfile } = await supabase
              .from("users")
              .select("*")
              .eq("id", supabaseUser.id)
              .single();
            return existingProfile as User | null;
          }
          console.error("Failed to auto-create profile:", error.message);
          return null;
        }
        return data as User;
      } catch (err) {
        console.error("Failed to auto-create profile:", err);
        return null;
      } finally {
        profileCreatingRef.current = false;
      }
    },
    [configured]
  );

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
          // PGRST116 = row not found — profile doesn't exist yet
          if (error.code === "PGRST116") {
            return await createProfile(supabaseUser);
          }
          console.error("Failed to fetch user profile:", error.message);
          return null;
        }
        return data as User | null;
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        return null;
      }
    },
    [configured, createProfile]
  );

  useEffect(() => {
    if (!configured) return;

    let mounted = true;
    const supabase = createClient();

    // Safety timeout: 15s to accommodate Supabase free tier cold starts.
    // Normal resolution happens in 1-3s; this is purely a last resort.
    const timeout = setTimeout(() => {
      if (mounted) {
        setState((prev) => {
          if (prev.isLoading) {
            console.warn("Auth loading timeout (15s) - setting to not loading");
            return { ...prev, isLoading: false };
          }
          return prev;
        });
      }
    }, 15000);

    // Single source of truth: onAuthStateChange handles everything.
    // INITIAL_SESSION replaces the old initAuth() call, eliminating the race condition.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED"
        ) {
          if (session?.user) {
            // Set session IMMEDIATELY so UI shows authenticated state.
            // Profile fetch can be slow (Supabase free tier cold start).
            setState((prev) => ({ ...prev, session, isLoading: false }));
            // Then fetch profile in background
            const profile = await fetchProfile(session.user);
            if (mounted) {
              setState((prev) => ({ ...prev, user: profile }));
            }
          } else if (event === "INITIAL_SESSION") {
            // No session on page load — user is not logged in
            setState({ user: null, session: null, isLoading: false });
          }
        } else if (event === "SIGNED_OUT") {
          if (mounted) {
            setState({ user: null, session: null, isLoading: false });
          }
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [configured, fetchProfile]);

  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error: string | null; needsConfirmation: boolean }> => {
      if (!configured)
        return { error: "Supabase is not configured", needsConfirmation: false };
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/confirm`,
          },
        });

        if (error) {
          return { error: error.message, needsConfirmation: false };
        }

        // Detect existing user: Supabase returns a user with empty identities
        // and no session when the email is already registered.
        if (
          data.user &&
          (!data.user.identities || data.user.identities.length === 0)
        ) {
          return {
            error:
              "An account with this email already exists. Please sign in instead.",
            needsConfirmation: false,
          };
        }

        // If there's a session, auto-confirmation is enabled and sign-in happened.
        // onAuthStateChange will fire SIGNED_IN and handle the state update.
        if (data.session) {
          return { error: null, needsConfirmation: false };
        }

        // No session but valid user = email confirmation required
        return { error: null, needsConfirmation: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Sign up failed";
        return { error: message, needsConfirmation: false };
      }
    },
    [configured]
  );

  const signInWithEmail = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error: string | null }> => {
      if (!configured) return { error: "Supabase is not configured" };
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          return { error: error.message };
        }
        return { error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Sign in failed";
        return { error: message };
      }
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
    signUpWithEmail,
    signInWithEmail,
    signOut,
  };
}
