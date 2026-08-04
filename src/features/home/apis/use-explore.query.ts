"use client";

import { useQuery } from "@tanstack/react-query";

import type { Artist, Genre, Song } from "@/contracts";

type ExploreData = {
  songs: Song[];
  artists: Artist[];
  genres: Genre[];
};

async function fetchExplore(): Promise<ExploreData> {
  const response = await fetch("/api/deezer/explore");
  const payload = await response.json();

  if (payload.status !== 200) {
    throw new Error(payload.message || "Failed to load explore data");
  }

  return payload.data as ExploreData;
}

export function useExploreQuery() {
  return useQuery({
    queryKey: ["deezer-explore"],
    queryFn: fetchExplore,
  });
}
