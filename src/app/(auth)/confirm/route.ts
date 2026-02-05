import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/helpers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=not_configured`);
  }

  if (token_hash && type) {
    const redirectUrl = `${origin}${next}`;
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "recovery" | "email",
    });

    if (!error && data.user) {
      // Check if user profile exists, create if not
      const { data: existingProfile } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingProfile) {
        // Create new profile from email
        const email = data.user.email || "";

        // Generate username from email prefix
        let username = email.split("@")[0] || `user${Date.now()}`;

        // Ensure username is unique by checking and appending random suffix if needed
        const { data: usernameCheck } = await supabase
          .from("users")
          .select("id")
          .eq("username", username)
          .single();

        if (usernameCheck) {
          username = `${username}${Math.floor(Math.random() * 10000)}`;
        }

        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          username,
          avatar_url: null,
          bio: null,
          steam_id: null,
          psn_id: null,
          xbox_id: null,
        });

        if (insertError) {
          console.error("Failed to create user profile:", insertError);
          // Don't block login, just log the error
        }
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
