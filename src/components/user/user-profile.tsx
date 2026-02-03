"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, X, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/types";

interface UserProfileProps {
  profile: User;
  isOwner: boolean;
}

function PlatformBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="glass border border-white/10 rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{label}</span>{" "}
      {value}
    </span>
  );
}

export function UserProfile({ profile: initialProfile, isOwner }: UserProfileProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: profile.username,
    bio: profile.bio ?? "",
    avatar_url: profile.avatar_url ?? "",
    cover_url: profile.cover_url ?? "",
    steam_id: profile.steam_id ?? "",
    psn_id: profile.psn_id ?? "",
    xbox_id: profile.xbox_id ?? "",
  });

  function startEditing() {
    setForm({
      username: profile.username,
      bio: profile.bio ?? "",
      avatar_url: profile.avatar_url ?? "",
      cover_url: profile.cover_url ?? "",
      steam_id: profile.steam_id ?? "",
      psn_id: profile.psn_id ?? "",
      xbox_id: profile.xbox_id ?? "",
    });
    setError(null);
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const updates = {
      username: form.username.trim(),
      bio: form.bio.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      cover_url: form.cover_url.trim() || null,
      steam_id: form.steam_id.trim() || null,
      psn_id: form.psn_id.trim() || null,
      xbox_id: form.xbox_id.trim() || null,
    };

    const { data, error: dbError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", profile.id)
      .select()
      .single();

    setSaving(false);

    if (dbError) {
      if (dbError.code === "23505") {
        setError("That username is already taken.");
      } else {
        setError(dbError.message);
      }
      return;
    }

    if (data) {
      setProfile(data as User);
    }
    setEditing(false);
  }

  const hasBadges = profile.steam_id || profile.psn_id || profile.xbox_id;

  return (
    <div className="space-y-6">
      {/* Cover */}
      <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden glass">
        {profile.cover_url ? (
          <Image
            src={profile.cover_url}
            alt="Cover"
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-purple)]/30 to-[var(--gradient-cyan)]/30" />
        )}
      </div>

      {/* Avatar + Info */}
      <div className="relative -mt-16 ml-6 sm:ml-8 flex items-end gap-4">
        <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-4 border-background glass shrink-0">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--gradient-purple)] to-[var(--gradient-cyan)] flex items-center justify-center text-2xl font-bold text-white">
              {profile.username.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="pb-1 flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">
            @{profile.username}
          </h1>
          {profile.created_at && (
            <p className="text-sm text-muted-foreground">
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
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>

      {/* Bio + Badges */}
      {!editing && (
        <div className="glass p-6 rounded-2xl space-y-4">
          {profile.bio ? (
            <p className="text-sm leading-relaxed">{profile.bio}</p>
          ) : isOwner ? (
            <p className="text-sm text-muted-foreground italic">
              No bio yet. Click Edit to add one.
            </p>
          ) : null}

          {hasBadges && (
            <div className="flex flex-wrap gap-2">
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
      )}

      {/* Edit Form */}
      {editing && (
        <div className="glass p-6 rounded-2xl space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Username</label>
            <Input
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              className="glass border-white/10 rounded-xl"
            />
          </div>

          <div className="space-y-3">
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

          <div className="space-y-3">
            <label className="block text-sm font-medium">Avatar URL</label>
            <Input
              value={form.avatar_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, avatar_url: e.target.value }))
              }
              placeholder="https://..."
              className="glass border-white/10 rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Cover URL</label>
            <Input
              value={form.cover_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, cover_url: e.target.value }))
              }
              placeholder="https://..."
              className="glass border-white/10 rounded-xl"
            />
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
              onClick={() => setEditing(false)}
              variant="outline"
              size="sm"
              className="glass border-white/10 rounded-xl gap-1.5"
              disabled={saving}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              onClick={save}
              size="sm"
              className="rounded-xl gap-1.5"
              disabled={saving}
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
  );
}
