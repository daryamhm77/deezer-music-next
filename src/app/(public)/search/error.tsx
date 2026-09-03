"use client";

import { useEffect } from "react";

type SearchErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SearchError({ error, reset }: SearchErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-2xl font-bold text-white">Search failed</h2>
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
