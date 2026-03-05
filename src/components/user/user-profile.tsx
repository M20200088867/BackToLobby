"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, X, Check, Loader2, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";
import { useAuthContext } from "@/lib/auth-context";
import { uploadAvatar, AvatarUploadError } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User, Review } from "@/types";

interface UserProfileProps {
  profile: User;
  isOwner: boolean;
  userReviews?: Review[];
}

function PlatformBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="glass border border-white/10 rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{label}</span>{" "}
      {value}
    </span>
  );
}

export function UserProfile({ profile: initialProfile, isOwner, userReviews }: UserProfileProps) {
  const router = useRouter();
  const { refreshProfile } = useAuthContext();
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    username: profile.username,
    bio: profile.bio ?? "",
    steam_id: profile.steam_id ?? "",
    psn_id: profile.psn_id ?? "",
    xbox_id: profile.xbox_id ?? "",
    favorite_game_id: profile.favorite_game_id ?? null as number | null,
  });

  function startEditing() {
    setForm({
      username: profile.username,
      bio: profile.bio ?? "",
      steam_id: profile.steam_id ?? "",
      psn_id: profile.psn_id ?? "",
      xbox_id: profile.xbox_id ?? "",
      favorite_game_id: profile.favorite_game_id ?? null,
    });
    setPendingAvatarUrl(null);
    setError(null);
    setEditing(true);
  }

  async function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setError(null);

    try {
      const url = await uploadAvatar(profile.id, file);
      setPendingAvatarUrl(url);
    } catch (err) {
      if (err instanceof AvatarUploadError) {
        setError(err.message);
      } else {
        setError("Failed to upload avatar.");
      }
    } finally {
      setAvatarUploading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function save() {
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured. Cannot save profile.");
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = createClient();
    const updates: Record<string, unknown> = {
      username: form.username.trim(),
      bio: form.bio.trim() || null,
      steam_id: form.steam_id.trim() || null,
      psn_id: form.psn_id.trim() || null,
      xbox_id: form.xbox_id.trim() || null,
      favorite_game_id: form.favorite_game_id ?? null,
    };

    if (pendingAvatarUrl !== null) {
      updates.avatar_url = pendingAvatarUrl;
    }

    const { data, error: dbError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", profile.id)
      .select("*, favorite_game:games!users_favorite_game_id_fkey(id,title,cover_url,slug)")
      .single();

    if (dbError) {
      setSaving(false);
      if (dbError.code === "23505") {
        setError("That username is already taken.");
      } else {
        setError(dbError.message);
      }
      return;
    }

    if (data) {
      const savedProfile = data as User;
      const usernameChanged = savedProfile.username !== profile.username;
      setProfile(savedProfile);
      setPendingAvatarUrl(null);
      await refreshProfile();
      setSaving(false);
      if (usernameChanged) {
        router.replace(`/user/${savedProfile.username}`);
        return;
      }
    }
    setEditing(false);
  }

  const displayAvatarUrl = pendingAvatarUrl ?? profile.avatar_url;
  const hasBadges = profile.steam_id || profile.psn_id || profile.xbox_id;

  // Build list of reviewed games for the favorite game dropdown
  const reviewedGames = userReviews
    ? userReviews
        .filter((r) => r.game)
        .map((r) => r.game!)
        .filter((g, i, arr) => arr.findIndex((x) => x.id === g.id) === i)
        .sort((a, b) => a.title.localeCompare(b.title))
    : [];

  return (
    <div className="space-y-6">
      {/* Profile Header — horizontal layout */}
      <div className="glass p-6 rounded-2xl">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-2 border-black/[0.06] dark:border-white/10 glass">
              {displayAvatarUrl ? (
                <Image
                  src={displayAvatarUrl}
                  alt={profile.username}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center text-2xl font-bold text-white">
                  {profile.username.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            {/* Camera overlay — only in edit mode */}
            {editing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                aria-label="Upload avatar photo"
              >
                {avatarUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold truncate">
                  @{profile.username}
                </h1>
                {profile.created_at && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Joined{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              {isOwner && !editing && (
                <Button
                  onClick={startEditing}
                  variant="outline"
                  size="sm"
                  className="glass border border-white/10 rounded-xl gap-1.5 shrink-0"
                  data-profile-edit
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </div>

            {!editing && profile.bio && (
              <p className="text-sm leading-relaxed mt-3">{profile.bio}</p>
            )}
            {!editing && !profile.bio && isOwner && (
              <p className="text-sm text-muted-foreground italic mt-3">
                No bio yet. Click Edit to add one.
              </p>
            )}

            {!editing && hasBadges && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.steam_id && (
                  <PlatformBadge label="Steam" value={profile.steam_id} />
                )}
                {profile.psn_id && (
                  <PlatformBadge label="PSN" value={profile.psn_id} />
                )}
                {profile.xbox_id && (
                  <PlatformBadge label="Xbox" value={profile.xbox_id} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Username</label>
              <Input
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                className="glass border-white/10 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: e.target.value }))
                }
                rows={3}
                className="w-full glass border border-white/10 rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Favorite Game picker */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Favorite Game</label>
              {reviewedGames.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Log a game first to set a favorite.
                </p>
              ) : (
                <select
                  value={form.favorite_game_id ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      favorite_game_id: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="">None</option>
                  {reviewedGames.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Steam ID</label>
                <Input
                  value={form.steam_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, steam_id: e.target.value }))
                  }
                  className="glass border-white/10 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">PSN ID</label>
                <Input
                  value={form.psn_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, psn_id: e.target.value }))
                  }
                  className="glass border-white/10 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Xbox ID</label>
                <Input
                  value={form.xbox_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, xbox_id: e.target.value }))
                  }
                  className="glass border-white/10 rounded-xl"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setPendingAvatarUrl(null);
                  setEditing(false);
                }}
                variant="outline"
                size="sm"
                className="glass border-white/10 rounded-xl gap-1.5"
                disabled={saving || avatarUploading}
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                onClick={save}
                size="sm"
                className="rounded-xl gap-1.5"
                disabled={saving || avatarUploading}
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
