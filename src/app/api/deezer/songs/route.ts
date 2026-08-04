import { NextResponse } from "next/server";

import { deezerFetch } from "@/connections/deezer.connection";
import { mapTrackToSong } from "@/connections/deezer.mappers";
import type { Song, SongsListResponse } from "@/contracts/endpoints/deezer";

type DeezerChartTracksResponse = {
  data?: unknown[];
};

export async function GET() {
  try {
    const chart = await deezerFetch<DeezerChartTracksResponse>(
      "/chart/0/tracks?limit=50",
    );

    const songs = (chart.data ?? [])
      .map(mapTrackToSong)
      .filter((song): song is Song => Boolean(song));

    const payload: SongsListResponse = {
      status: 200,
      data: songs,
    };

    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch songs";

    const payload: SongsListResponse = {
      status: 500,
      message,
    };

    return NextResponse.json(payload, { status: 500 });
  }
}
