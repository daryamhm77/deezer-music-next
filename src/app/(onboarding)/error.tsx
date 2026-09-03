"use client";

import { useEffect } from "react";

type OnboardingErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function OnboardingError({
  error,
  reset,
}: OnboardingErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-2xl font-bold text-white">Setup failed</h2>
      <p className="text-secondary-text">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="cursor-pointer rounded-full bg-primary px-5 py-2 font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}
