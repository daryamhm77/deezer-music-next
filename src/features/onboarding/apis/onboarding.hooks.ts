"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Artist } from "@/contracts";

type OnboardingStatus = {
  onboardingCompleted: boolean;
  selectedArtistsCount: number;
};

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (payload.status !== 200) {
    throw new Error(payload.message || "Request failed");
  }
  return payload.data as T;
}

export function useOnboardingStatusQuery(enabled = true) {
  return useQuery({
    queryKey: ["onboarding-status"],
    enabled,
    queryFn: async () => {
      const response = await fetch("/api/onboarding/status");
      return parseJson<OnboardingStatus>(response);
    },
    staleTime: 30_000,
  });
}

export function useArtistSuggestionsQuery(search: string) {
  const query = search.trim();

  return useQuery({
    queryKey: ["deezer-artists", query || "chart"],
    queryFn: async () => {
      const url = query
        ? `/api/deezer/artists?q=${encodeURIComponent(query)}`
        : "/api/deezer/artists";
      const response = await fetch(url);
      return parseJson<Artist[]>(response);
    },
  });
}

export function useCompleteOnboardingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artists: Artist[]) => {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artists }),
      });
      return parseJson<{
        preferences: { onboardingCompleted: boolean };
      }>(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
      await queryClient.invalidateQueries({ queryKey: ["favorite-artists"] });
    },
  });
}
