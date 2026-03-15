"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { SignupWizard } from "@/components/auth/signup-wizard";

function SignUpContent() {
  const router = useRouter();
  const { session, isLoading } = useAuthContext();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isLoading && session && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/");
    }
  }, [isLoading, session, router]);

  if (!isLoading && session) return null;

  if (isLoading) {
    return (
      <div className="glass p-8 rounded-3xl max-w-lg w-full text-center">
        <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <SignupWizard />;
}

export default function SignUpPage() {
  return (
    <div className="mesh-gradient min-h-screen flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="glass p-8 rounded-3xl max-w-lg w-full text-center">
            <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        }
      >
        <SignUpContent />
      </Suspense>
    </div>
  );
}
