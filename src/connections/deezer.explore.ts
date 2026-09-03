import { z } from "zod";

import { deezerFetch } from "@/connections/deezer.connection";
import { mapTrackToSong } from "@/connections/deezer.mappers";
import {
  ArtistSchema,
  DeezerArtistSchema,
  GenreSchema,
  type Artist,
  type Genre,
  type Song,
} from "@/contracts/endpoints/deezer";

const DeezerGenreSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  picture_medium: z.string().url().optional().nullable(),
  picture_big: z.string().url().optional().nullable(),
  picture_xl: z.string().url().optional().nullable(),
});

type ListResponse = {
  data?: unknown[];
};

export type ExploreCatalog = {
  songs: Song[];
  artists: Artist[];
  genres: Genre[];
};

function mapArtist(item: unknown): Artist | null {
  const parsed = DeezerArtistSchema.safeParse(item);
  if (!parsed.success) return null;

  return {
    id: String(parsed.data.id),
    name: parsed.data.name,
    image_url: parsed.data.picture_big || parsed.data.picture_medium || null,
  };
}

function mapGenre(item: unknown): Genre | null {
  const parsed = DeezerGenreSchema.safeParse(item);
  if (!parsed.success) return null;
  if (String(parsed.data.id) === "0") return null;

  return {
    id: String(parsed.data.id),
    name: parsed.data.name,
    image_url:
      parsed.data.picture_xl ||
      parsed.data.picture_big ||
      parsed.data.picture_medium ||
      null,
  };
}

/** Streamable independently for Suspense sections. */
export async function getExploreSongs(limit = 20): Promise<Song[]> {
  const tracksRes = await deezerFetch<ListResponse>(
    `/chart/0/tracks?limit=${limit}`,
  );

  return (tracksRes.data ?? [])
    .map(mapTrackToSong)
    .filter((song): song is Song => Boolean(song));
}

export async function getExploreArtists(limit = 20): Promise<Artist[]> {
  const artistsRes = await deezerFetch<ListResponse>(
    `/chart/0/artists?limit=${limit}`,
  );

  const artists = (artistsRes.data ?? [])
    .map(mapArtist)
    .filter((artist): artist is Artist => Boolean(artist));

  ArtistSchema.array().parse(artists);
  return artists;
}

export async function getExploreGenres(limit = 20): Promise<Genre[]> {
  const genresRes = await deezerFetch<ListResponse>("/genre");

  const genres = (genresRes.data ?? [])
    .map(mapGenre)
    .filter((genre): genre is Genre => Boolean(genre))
    .slice(0, limit);

  GenreSchema.array().parse(genres);
  return genres;
}

/** Full catalog (API + metadata). Prefer section fetchers for streaming UI. */
export async function getExploreCatalog(): Promise<ExploreCatalog> {
  const [songs, artists, genres] = await Promise.all([
    getExploreSongs(),
    getExploreArtists(),
    getExploreGenres(),
  ]);

  return { songs, artists, genres };
}
