"use client";

import { useQuery } from "@tanstack/react-query";

import type { Artist, Song } from "@/contracts";

export type SearchResults = {
  songs: Song[];
  artists: Artist[];
};

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (payload.status !== 200) {
    throw new Error(payload.message || "Request failed");
  }
  return payload.data as T;
}

export function useSearchQuery(
  query: string,
  initialData?: SearchResults | null,
) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["deezer-search", trimmed],
    enabled: trimmed.length > 0,
    initialData: trimmed && initialData ? initialData : undefined,
    staleTime: trimmed && initialData ? 30_000 : 0,
    queryFn: async () => {
      const response = await fetch(
        `/api/deezer/search?q=${encodeURIComponent(trimmed)}`,
      );
      return parseJson<SearchResults>(response);
    },
  });
}
