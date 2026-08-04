import { searchDeezerArtists } from "@/connections/deezer.artists";
import { deezerFetch } from "@/connections/deezer.connection";
import { mapTrackToSong } from "@/connections/deezer.mappers";
import type { Artist, Song } from "@/contracts";

type ListResponse = {
  data?: unknown[];
};

export async function searchDeezerSongs(query: string, limit = 24) {
  const encoded = encodeURIComponent(query);
  const result = await deezerFetch<ListResponse>(
    `/search/track?q=${encoded}&limit=${limit}`,
  );

  return (result.data ?? [])
    .map(mapTrackToSong)
    .filter((song): song is Song => Boolean(song));
}

export async function searchDeezerCatalog(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return { songs: [] as Song[], artists: [] as Artist[] };
  }

  const [songs, artists] = await Promise.all([
    searchDeezerSongs(trimmed, 24),
    searchDeezerArtists(trimmed, 16),
  ]);

  return { songs, artists };
}
