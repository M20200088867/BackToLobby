"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Gamepad2, AlertCircle, Info, Mail, Lock, Loader2 } from "lucide-react";
import { useAuthContext } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading, configured, signInWithEmail } =
    useAuthContext();
  const hasRedirected = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const error = searchParams.get("error");

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (!isLoading && session && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/");
    }
  }, [isLoading, session, router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setEmailError("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    setEmailError(null);

    const result = await signInWithEmail(email, password);
    if (result.error) {
      setEmailError(result.error);
    }
    setIsSubmitting(false);
    // If successful, the auth state change will trigger redirect
  };

  // Show nothing while redirecting (already logged in)
  if (!isLoading && session) {
    return null;
  }

  // Show loading spinner only during initial auth check
  if (isLoading) {
    return (
      <div className="glass p-8 rounded-3xl max-w-md w-full text-center">
        <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-3xl max-w-md w-full space-y-6">
      <div className="text-center space-y-2">
        <Gamepad2 className="h-12 w-12 mx-auto text-primary" />
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-muted-foreground">
          Sign in to start your gaming diary.
        </p>
      </div>

      {error === "auth" && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Authentication failed. Please try again.</span>
        </div>
      )}

      {error === "not_configured" && (
        <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            Supabase is not configured. Set environment variables to enable
            auth.
          </span>
        </div>
      )}

      {!configured ? (
        <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            Authentication is not available. Set NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY to enable sign-in.
          </span>
        </div>
      ) : (
        <>
          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            {emailError && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{emailError}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-white/5 border-white/10"
                  disabled={isSubmitting}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-white/5 border-white/10"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign In with Email"
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mesh-gradient min-h-screen flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="glass p-8 rounded-3xl max-w-md w-full text-center">
            <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
