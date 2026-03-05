import { createClient } from "./client";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export class AvatarUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AvatarUploadError";
  }
}

/**
 * Uploads a user avatar to the `avatars` bucket and returns the public URL.
 * File is stored at `{userId}/{timestamp}.{ext}`.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new AvatarUploadError(
      "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image."
    );
  }

  if (file.size > MAX_SIZE) {
    throw new AvatarUploadError("File is too large. Maximum size is 2 MB.");
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    throw new AvatarUploadError(error.message);
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
