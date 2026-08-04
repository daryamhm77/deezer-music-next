import { NextResponse } from "next/server";
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

function mapArtist(item: unknown): Artist | null {
  const parsed = DeezerArtistSchema.safeParse(item);
  if (!parsed.success) return null;

  return {
    id: String(parsed.data.id),
    name: parsed.data.name,
    image_url:
      parsed.data.picture_big || parsed.data.picture_medium || null,
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

export async function GET() {
  try {
    const [tracksRes, artistsRes, genresRes] = await Promise.all([
      deezerFetch<ListResponse>("/chart/0/tracks?limit=20"),
      deezerFetch<ListResponse>("/chart/0/artists?limit=20"),
      deezerFetch<ListResponse>("/genre"),
    ]);

    const songs = (tracksRes.data ?? [])
      .map(mapTrackToSong)
      .filter((song): song is Song => Boolean(song));

    const artists = (artistsRes.data ?? [])
      .map(mapArtist)
      .filter((artist): artist is Artist => Boolean(artist));

    const genres = (genresRes.data ?? [])
      .map(mapGenre)
      .filter((genre): genre is Genre => Boolean(genre))
      .slice(0, 20);

    // Validate mapped shapes lightly for consistency.
    ArtistSchema.array().parse(artists);
    GenreSchema.array().parse(genres);

    return NextResponse.json({
      status: 200,
      data: {
        songs,
        artists,
        genres,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message:
          error instanceof Error ? error.message : "Failed to fetch explore data",
      },
      { status: 500 },
    );
  }
}
