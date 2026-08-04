import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getArtistTopSongs,
  shuffleSongs,
  uniqueSongs,
} from "@/connections/deezer.artists";
import {
  addFavoriteArtist,
  createPlaylist,
} from "@/connections/library.repository";
import { completeOnboarding } from "@/connections/user-preferences.repository";
import { ArtistSchema, type Song } from "@/contracts";
import { requireUserId } from "@/lib/auth-session";

const CompleteOnboardingSchema = z.object({
  artists: z.array(ArtistSchema).min(10).max(50),
});

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = CompleteOnboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        status: 500,
        message: "Select at least 10 artists to continue",
      },
      { status: 400 },
    );
  }

  const artists = parsed.data.artists;

  try {
    const trackGroups = await Promise.all(
      artists.map(async (artist) => {
        try {
          return await getArtistTopSongs(artist.id, 8);
        } catch {
          return [] as Song[];
        }
      }),
    );

    const allTracks = uniqueSongs(trackGroups.flat());
    const hitTracks = uniqueSongs(
      trackGroups
        .map((group) => group[0])
        .filter((song): song is Song => Boolean(song)),
    );
    const deepTracks = shuffleSongs(allTracks).slice(0, 30);
    const mixTracks = shuffleSongs(allTracks).slice(0, 25);

    await Promise.all(artists.map((artist) => addFavoriteArtist(userId, artist)));

    const playlists = [];

    if (mixTracks.length > 0) {
      playlists.push(
        await createPlaylist(
          userId,
          "Made for you",
          "A mix based on the artists you chose",
          mixTracks,
        ),
      );
    }

    if (hitTracks.length > 0) {
      playlists.push(
        await createPlaylist(
          userId,
          "Your artists' hits",
          "Top tracks from your selected singers",
          hitTracks,
        ),
      );
    }

    if (deepTracks.length > 0) {
      playlists.push(
        await createPlaylist(
          userId,
          "Deep mix",
          "More tracks inspired by your taste",
          deepTracks,
        ),
      );
    }

    const preferences = await completeOnboarding(userId, artists);

    return NextResponse.json({
      status: 200,
      data: {
        preferences,
        playlists,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message:
          error instanceof Error
            ? error.message
            : "Failed to complete onboarding",
      },
      { status: 500 },
    );
  }
}
