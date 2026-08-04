"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { Song, SongsListResponse } from "@/contracts";

async function fetchSongs(): Promise<Song[]> {
  const response = await fetch("/api/deezer/songs");
  const payload = (await response.json()) as SongsListResponse;

  if (payload.status !== 200) {
    throw new Error(payload.message);
  }

  return payload.data;
}

export function useGetSongsQuery() {
  const query = useQuery({
    queryKey: ["deezer-songs"],
    queryFn: fetchSongs,
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
