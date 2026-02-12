"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Gamepad2, AlertCircle, Info, Mail, Lock, Loader2 } from "lucide-react";
import { useAuthContext } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading, configured, signInWithGoogle, signInWithEmail } =
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth */}
          <Button
            onClick={signInWithGoogle}
            className="w-full glass border border-white/10 hover:bg-white/10 text-foreground rounded-xl h-12 text-base gap-3"
            variant="outline"
          >
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </Button>

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
