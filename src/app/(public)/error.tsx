"use client";

import { useEffect } from "react";

type PublicErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicError({ error, reset }: PublicErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
      <p className="max-w-md text-secondary-text">
        {error.message || "Failed to load this page."}
      </p>
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
