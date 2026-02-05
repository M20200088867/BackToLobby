import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  return createBrowserClient(url, anonKey, {
    cookies: {
      getAll() {
        const pairs = document.cookie.split("; ");
        return pairs
          .filter(Boolean)
          .map((pair) => {
            const [name, ...rest] = pair.split("=");
            return { name: name || "", value: decodeURIComponent(rest.join("=")) };
          })
          .filter((cookie) => cookie.name);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookie = `${name}=${encodeURIComponent(value)}`;
          if (options?.path) cookie += `; path=${options.path}`;
          // Handle maxAge - 0 or negative means delete the cookie
          if (options?.maxAge !== undefined) {
            cookie += `; max-age=${options.maxAge}`;
          }
          if (options?.domain) cookie += `; domain=${options.domain}`;
          if (options?.sameSite) cookie += `; samesite=${options.sameSite}`;
          if (options?.secure) cookie += `; secure`;
          document.cookie = cookie;
        });
      },
    },
  });
}
