import { deezerFetch } from "@/connections/deezer.connection";
import { mapTrackToSong } from "@/connections/deezer.mappers";
import { DeezerArtistSchema, type Artist, type Song } from "@/contracts";

type ListResponse = {
  data?: unknown[];
};

export function mapDeezerArtist(item: unknown): Artist | null {
  const parsed = DeezerArtistSchema.safeParse(item);
  if (!parsed.success) return null;

  return {
    id: String(parsed.data.id),
    name: parsed.data.name,
    image_url: parsed.data.picture_big || parsed.data.picture_medium || null,
  };
}

export async function searchDeezerArtists(query: string, limit = 20) {
  const encoded = encodeURIComponent(query);
  const result = await deezerFetch<ListResponse>(
    `/search/artist?q=${encoded}&limit=${limit}`,
  );

  return (result.data ?? [])
    .map(mapDeezerArtist)
    .filter((artist): artist is Artist => Boolean(artist));
}

export async function getChartArtists(limit = 40) {
  const result = await deezerFetch<ListResponse>(
    `/chart/0/artists?limit=${limit}`,
  );

  return (result.data ?? [])
    .map(mapDeezerArtist)
    .filter((artist): artist is Artist => Boolean(artist));
}

export async function getArtistTopSongs(artistId: string, limit = 10) {
  const result = await deezerFetch<ListResponse>(
    `/artist/${artistId}/top?limit=${limit}`,
  );

  return (result.data ?? [])
    .map(mapTrackToSong)
    .filter((song): song is Song => Boolean(song));
}

export function shuffleSongs<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = temp;
  }
  return copy;
}

export function uniqueSongs(songs: Song[]) {
  const seen = new Set<string>();
  return songs.filter((song) => {
    if (seen.has(song.id)) return false;
    seen.add(song.id);
    return true;
  });
}
