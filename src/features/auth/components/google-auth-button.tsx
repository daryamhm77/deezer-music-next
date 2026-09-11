"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { signIn } from "@/lib/auth-client";
import authMessages from "@/messages/en/auth.json";
import { PATHS } from "@/routes/paths";

type GoogleAuthButtonProps = {
  callbackURL?: string;
};

/** Shown when `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` (set alongside Google secrets on Vercel). */
export function GoogleAuthButton({
  callbackURL = PATHS.onboarding,
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED !== "true") {
    return null;
  }

  const handleGoogle = async () => {
    setError("");
    setIsLoading(true);

    const { error: authError } = await signIn.social({
      provider: "google",
      callbackURL,
    });

    if (authError) {
      setError(authError.message || authMessages.genericError);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error ? (
        <p className="mb-4 bg-primary py-1 text-center font-semibold text-white">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isLoading}
        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-border bg-transparent py-3 font-bold text-white hover:border-white disabled:opacity-60"
      >
        <FcGoogle size={22} />
        {authMessages.continueWithGoogle}
      </button>
    </div>
  );
}
