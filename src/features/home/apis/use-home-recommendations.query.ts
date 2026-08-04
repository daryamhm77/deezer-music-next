"use client";

import { useQuery } from "@tanstack/react-query";

import type { Artist, Genre, Playlist, Song } from "@/contracts";

export type HomeRecommendations = {
  following: Artist[];
  recommendedArtists: Artist[];
  recommendedSongs: Song[];
  topGenres: Array<Genre & { songs: Song[] }>;
  playlists: Playlist[];
};

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (payload.status !== 200) {
    throw new Error(payload.message || "Request failed");
  }
  return payload.data as T;
}

export function useHomeRecommendationsQuery(enabled = true) {
  return useQuery({
    queryKey: ["home-recommendations"],
    enabled,
    queryFn: async () => {
      const response = await fetch("/api/home/recommendations");
      return parseJson<HomeRecommendations>(response);
    },
    staleTime: 60_000,
  });
}
