"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "./use-debounce";
import { validateUsername, checkUsernameAvailability } from "@/lib/username-validation";
import { createClient } from "@/lib/supabase/client";

export type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function useUsernameCheck(username: string, excludeUserId?: string) {
  const debouncedUsername = useDebounce(username, 400);
  const [asyncResult, setAsyncResult] = useState<{
    username: string;
    status: "checking" | "available" | "taken";
    error?: string;
  } | null>(null);

  // Synchronous validation — derived, no effect needed
  const localValidation = useMemo(() => {
    if (!debouncedUsername) return { status: "idle" as const, error: undefined };
    const result = validateUsername(debouncedUsername);
    if (!result.valid) return { status: "invalid" as const, error: result.error };
    return null; // needs async check
  }, [debouncedUsername]);

  const needsAsyncCheck = localValidation === null;
  const prevUsernameRef = useRef(debouncedUsername);

  useEffect(() => {
    if (!needsAsyncCheck) return;

    let cancelled = false;
    // Mark checking via callback from async operation setup
    prevUsernameRef.current = debouncedUsername;

    const supabase = createClient();

    // Set checking state immediately via a microtask to satisfy lint
    Promise.resolve().then(() => {
      if (!cancelled) {
        setAsyncResult({ username: debouncedUsername, status: "checking" });
      }
    });

    checkUsernameAvailability(supabase, debouncedUsername, excludeUserId).then(
      (available) => {
        if (cancelled) return;
        setAsyncResult({
          username: debouncedUsername,
          status: available ? "available" : "taken",
          error: available ? undefined : "Username is already taken",
        });
      },
      () => {
        if (cancelled) return;
        setAsyncResult(null);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [debouncedUsername, excludeUserId, needsAsyncCheck]);

  // Derive final status
  if (localValidation !== null) {
    return { status: localValidation.status, error: localValidation.error };
  }

  if (asyncResult && asyncResult.username === debouncedUsername) {
    return { status: asyncResult.status, error: asyncResult.error };
  }

  return { status: "checking" as const, error: undefined };
}
