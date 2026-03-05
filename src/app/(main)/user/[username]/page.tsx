import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { createClient } from "@/lib/supabase/server";
import { UserProfile, UserNotFound, UserReviewsList } from "@/components/user";
import type { User, Review } from "@/types";

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
    .select(
      "*, favorite_game:games!users_favorite_game_id_fkey(id,title,cover_url,slug)"
    )
    .eq("username", username)
    .single();

  if (!profile) {
    return <UserNotFound />;
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const isOwner = authUser?.id === profile.id;

  // Pre-fetch reviews on the server so UserProfile can show the fav game picker
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, game:games(id,igdb_id,title,cover_url,slug)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const typedProfile = profile as User;
  const typedReviews = (reviews ?? []) as Review[];

  return (
    <div className="space-y-8">
      <UserProfile
        profile={typedProfile}
        isOwner={isOwner}
        userReviews={typedReviews}
      />
      <UserReviewsList
        userId={profile.id}
        isOwner={isOwner}
        favoriteGame={typedProfile.favorite_game}
      />
    </div>
  );
}
