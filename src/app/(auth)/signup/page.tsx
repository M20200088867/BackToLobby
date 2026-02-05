"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Gamepad2,
  AlertCircle,
  Info,
  Mail,
  Lock,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useAuthContext } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SignUpContent() {
  const router = useRouter();
  const { session, isLoading, configured, signUpWithEmail } = useAuthContext();
  const hasRedirected = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (!isLoading && session && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/");
    }
  }, [isLoading, session, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    const result = await signUpWithEmail(email, password);
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setIsSubmitting(false);
    }
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

  // Success state
  if (success) {
    return (
      <div className="glass p-8 rounded-3xl max-w-md w-full space-y-6">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 mx-auto text-green-400" />
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a confirmation link to{" "}
            <span className="text-foreground font-medium">{email}</span>. Click
            the link to activate your account.
          </p>
        </div>
        <Link href="/login">
          <Button
            variant="outline"
            className="w-full glass border border-white/10 hover:bg-white/10 text-foreground rounded-xl h-12"
          >
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-3xl max-w-md w-full space-y-6">
      <div className="text-center space-y-2">
        <Gamepad2 className="h-12 w-12 mx-auto text-primary" />
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-muted-foreground">
          Sign up to start tracking your games.
        </p>
      </div>

      {!configured ? (
        <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            Authentication is not available. Set NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY to enable sign-up.
          </span>
        </div>
      ) : (
        <>
          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
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
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="mesh-gradient min-h-screen flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="glass p-8 rounded-3xl max-w-md w-full text-center">
            <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        }
      >
        <SignUpContent />
      </Suspense>
    </div>
  );
}
