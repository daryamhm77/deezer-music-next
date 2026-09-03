"use client";

import { useEffect } from "react";

type AuthErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Auth error</h2>
        <p className="text-secondary-text">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-full bg-primary px-5 py-2 font-bold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
