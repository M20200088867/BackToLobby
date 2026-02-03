import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/server";
import { UserProfile, UserNotFound } from "@/components/user";
import type { User } from "@/types";

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  if (!isSupabaseConfigured()) {
    return <UserNotFound />;
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    return <UserNotFound />;
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const isOwner = authUser?.id === profile.id;

  return <UserProfile profile={profile as User} isOwner={isOwner} />;
}
