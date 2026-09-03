"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Artist, Playlist, Song } from "@/contracts";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (payload.status !== 200) {
    throw new Error(payload.message || "Request failed");
  }
  return payload.data as T;
}

export function usePlaylistsQuery(enabled = true) {
  return useQuery({
    queryKey: ["playlists"],
    enabled,
    queryFn: async () => {
      const response = await fetch("/api/playlists");
      return parseJson<Playlist[]>(response);
    },
  });
}

export function usePlaylistQuery(id: string) {
  return useQuery({
    queryKey: ["playlists", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await fetch(`/api/playlists/${id}`);
      return parseJson<Playlist>(response);
    },
  });
}

export function useCreatePlaylistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string; description?: string }) => {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return parseJson<Playlist>(response);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export function useDeletePlaylistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/playlists/${id}`, { method: "DELETE" });
      return parseJson<{ id: string }>(response);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export function useAddSongToPlaylistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { playlistId: string; song: Song }) => {
      const response = await fetch(`/api/playlists/${input.playlistId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.song),
      });
      return parseJson<Playlist>(response);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
      void queryClient.invalidateQueries({
        queryKey: ["playlists", variables.playlistId],
      });
    },
  });
}

export function useRemoveSongFromPlaylistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { playlistId: string; songId: string }) => {
      const response = await fetch(
        `/api/playlists/${input.playlistId}/tracks?songId=${encodeURIComponent(input.songId)}`,
        { method: "DELETE" },
      );
      return parseJson<Playlist>(response);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
      void queryClient.invalidateQueries({
        queryKey: ["playlists", variables.playlistId],
      });
    },
  });
}

export function useFavoriteSongsQuery(enabled = true) {
  return useQuery({
    queryKey: ["favorite-songs"],
    enabled,
    queryFn: async () => {
      const response = await fetch("/api/favorites/songs");
      return parseJson<Song[]>(response);
    },
  });
}

export function useToggleFavoriteSongMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { song: Song; isFavorite: boolean }) => {
      if (input.isFavorite) {
        const response = await fetch(
          `/api/favorites/songs?songId=${encodeURIComponent(input.song.id)}`,
          { method: "DELETE" },
        );
        return parseJson<{ songId: string }>(response);
      }

      const response = await fetch("/api/favorites/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.song),
      });
      return parseJson<Song>(response);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorite-songs"] });
    },
  });
}

export function useFavoriteArtistsQuery(enabled = true) {
  return useQuery({
    queryKey: ["favorite-artists"],
    enabled,
    queryFn: async () => {
      const response = await fetch("/api/favorites/artists");
      return parseJson<Artist[]>(response);
    },
  });
}

export function useToggleFavoriteArtistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { artist: Artist; isFavorite: boolean }) => {
      if (input.isFavorite) {
        const response = await fetch(
          `/api/favorites/artists?artistId=${encodeURIComponent(input.artist.id)}`,
          { method: "DELETE" },
        );
        return parseJson<{ artistId: string }>(response);
      }

      const response = await fetch("/api/favorites/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.artist),
      });
      return parseJson<Artist>(response);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorite-artists"] });
    },
  });
}
