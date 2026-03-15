import type { SupabaseClient } from "@supabase/supabase-js";

export const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,19}$/;

export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (!username) {
    return { valid: false, error: "Username is required" };
  }
  if (username.length < 3) {
    return { valid: false, error: "Must be at least 3 characters" };
  }
  if (username.length > 20) {
    return { valid: false, error: "Must be 20 characters or fewer" };
  }
  if (!/^[a-z]/.test(username)) {
    return { valid: false, error: "Must start with a letter" };
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return {
      valid: false,
      error: "Only lowercase letters, numbers, and underscores",
    };
  }
  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: "Invalid username format" };
  }
  return { valid: true };
}

export async function checkUsernameAvailability(
  supabase: SupabaseClient,
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (!data) return true;
  if (excludeUserId && data.id === excludeUserId) return true;
  return false;
}
