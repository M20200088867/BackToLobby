"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  AlertCircle,
  Mail,
  Lock,
  Loader2,
  CheckCircle,
  User,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Camera,
} from "lucide-react";
import { useAuthContext } from "@/lib/auth-context";
import { useUsernameCheck } from "@/hooks/use-username-check";
import { validateUsername } from "@/lib/username-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountryCombobox } from "@/components/ui/combobox";

const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"] as const;

const ease = [0.25, 0.1, 0.25, 1] as const;

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    transition: { duration: 0.2, ease },
  }),
};

interface WizardState {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  country: string;
  favoritePlatforms: string[];
  steamId: string;
  psnId: string;
  xboxId: string;
  bio: string;
  avatarFile: File | null;
  avatarPreview: string | null;
}

export function SignupWizard() {
  const { signUpWithEmail } = useAuthContext();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<WizardState>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    country: "",
    favoritePlatforms: [],
    steamId: "",
    psnId: "",
    xboxId: "",
    bio: "",
    avatarFile: null,
    avatarPreview: null,
  });

  const { status: usernameStatus, error: usernameError } = useUsernameCheck(
    form.username
  );

  function updateForm(updates: Partial<WizardState>) {
    setForm((f) => ({ ...f, ...updates }));
  }

  function goNext() {
    setDirection(1);
    setStep((s) => s + 1);
    setError(null);
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => s - 1);
    setError(null);
  }

  function togglePlatform(platform: string) {
    updateForm({
      favoritePlatforms: form.favoritePlatforms.includes(platform)
        ? form.favoritePlatforms.filter((p) => p !== platform)
        : [...form.favoritePlatforms, platform],
    });
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    updateForm({
      avatarFile: file,
      avatarPreview: URL.createObjectURL(file),
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Step 1 validation
  const usernameValidation = validateUsername(form.username);
  const step1Valid =
    form.email.length > 0 &&
    form.password.length >= 6 &&
    form.confirmPassword === form.password &&
    usernameValidation.valid &&
    usernameStatus === "available";

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);

    const metadata: Record<string, unknown> = {
      username: form.username,
    };
    if (form.country) metadata.country = form.country;
    if (form.favoritePlatforms.length > 0)
      metadata.favorite_platforms = form.favoritePlatforms;
    if (form.bio.trim()) metadata.bio = form.bio.trim();
    if (form.steamId.trim()) metadata.steam_id = form.steamId.trim();
    if (form.psnId.trim()) metadata.psn_id = form.psnId.trim();
    if (form.xboxId.trim()) metadata.xbox_id = form.xboxId.trim();

    const result = await signUpWithEmail(form.email, form.password, metadata);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    if (result.needsConfirmation) {
      setSuccess(true);
      setIsSubmitting(false);
      return;
    }

    // Auto-confirmed: upload avatar if present, then redirect happens via onAuthStateChange
    if (form.avatarFile) {
      try {
        // We need to wait briefly for the profile to be created
        await new Promise((r) => setTimeout(r, 1500));
        // Avatar upload will happen on profile edit since we don't have the user ID yet
      } catch {
        // Don't block signup for avatar upload failure
      }
    }

    setIsSubmitting(false);
  }

  if (success) {
    return (
      <div className="glass p-8 rounded-3xl max-w-lg w-full space-y-6">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 mx-auto text-green-400" />
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a confirmation link to{" "}
            <span className="text-foreground font-medium">{form.email}</span>.
            Click the link to activate your account.
          </p>
          {form.avatarFile && (
            <p className="text-sm text-muted-foreground">
              You can upload your avatar from your profile after confirming.
            </p>
          )}
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
    <div className="glass p-8 rounded-3xl max-w-lg w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Gamepad2 className="h-12 w-12 mx-auto text-primary" />
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-muted-foreground text-sm">
          {step === 0 && "Set up your account credentials"}
          {step === 1 && "Tell us about your gaming setup"}
          {step === 2 && "Add a personal touch"}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step
                ? "w-8 bg-primary"
                : i < step
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Steps */}
      <div className="relative overflow-hidden min-h-[280px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => updateForm({ email: e.target.value })}
                    className="pl-10 h-12 rounded-xl bg-white/5 border-white/10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="coolplayer"
                    value={form.username}
                    onChange={(e) =>
                      updateForm({ username: e.target.value.toLowerCase() })
                    }
                    className="pl-10 pr-10 h-12 rounded-xl bg-white/5 border-white/10"
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === "checking" && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {usernameStatus === "available" && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {(usernameStatus === "taken" ||
                      usernameStatus === "invalid") && (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {usernameError && form.username.length > 0 && (
                  <p className="text-xs text-red-400">{usernameError}</p>
                )}
                {usernameStatus === "available" && (
                  <p className="text-xs text-green-500">Username is available</p>
                )}
                {!form.username && (
                  <p className="text-xs text-muted-foreground">
                    3-20 chars, lowercase letters, numbers, underscores
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={(e) => updateForm({ password: e.target.value })}
                    className="pl-10 h-12 rounded-xl bg-white/5 border-white/10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      updateForm({ confirmPassword: e.target.value })
                    }
                    className="pl-10 h-12 rounded-xl bg-white/5 border-white/10"
                    disabled={isSubmitting}
                  />
                </div>
                {form.confirmPassword &&
                  form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-400">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <Button
                onClick={goNext}
                disabled={!step1Valid || isSubmitting}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              {/* Country */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Country</label>
                <CountryCombobox
                  value={form.country}
                  onChange={(code) => updateForm({ country: code })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Platforms */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Favorite Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        form.favoritePlatforms.includes(platform)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "glass border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                      }`}
                      disabled={isSubmitting}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Gaming IDs */}
              {form.favoritePlatforms.includes("PC") && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Steam ID</label>
                  <Input
                    value={form.steamId}
                    onChange={(e) => updateForm({ steamId: e.target.value })}
                    placeholder="Your Steam username"
                    className="h-10 rounded-xl bg-white/5 border-white/10"
                    disabled={isSubmitting}
                  />
                </div>
              )}
              {form.favoritePlatforms.includes("PlayStation") && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">PSN ID</label>
                  <Input
                    value={form.psnId}
                    onChange={(e) => updateForm({ psnId: e.target.value })}
                    placeholder="Your PSN username"
                    className="h-10 rounded-xl bg-white/5 border-white/10"
                    disabled={isSubmitting}
                  />
                </div>
              )}
              {form.favoritePlatforms.includes("Xbox") && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Xbox ID</label>
                  <Input
                    value={form.xboxId}
                    onChange={(e) => updateForm({ xboxId: e.target.value })}
                    placeholder="Your Xbox gamertag"
                    className="h-10 rounded-xl bg-white/5 border-white/10"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={goBack}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl glass border-white/10 gap-2"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    setDirection(1);
                    setStep(2);
                  }}
                  variant="outline"
                  className="h-12 rounded-xl glass border-white/10"
                  disabled={isSubmitting}
                >
                  Skip
                </Button>
                <Button
                  onClick={goNext}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  disabled={isSubmitting}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              {/* Avatar */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Avatar</label>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-white/10 glass shrink-0">
                    {form.avatarPreview ? (
                      <Image
                        src={form.avatarPreview}
                        alt="Avatar preview"
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center text-lg font-bold text-white">
                        {form.username.slice(0, 2).toUpperCase() || "??"}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      aria-label="Choose avatar"
                    >
                      <Camera className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Click to upload a photo</p>
                    <p className="text-xs">JPG, PNG, WebP, or GIF. Max 2 MB.</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => updateForm({ bio: e.target.value })}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full glass border border-white/10 rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={goBack}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl glass border-white/10 gap-2"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sign in link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
