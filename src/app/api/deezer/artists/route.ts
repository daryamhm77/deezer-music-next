import { NextResponse } from "next/server";

import {
  getChartArtists,
  searchDeezerArtists,
} from "@/connections/deezer.artists";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  try {
    const data = query
      ? await searchDeezerArtists(query, 24)
      : await getChartArtists(40);

    return NextResponse.json({ status: 200, data });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message:
          error instanceof Error ? error.message : "Failed to fetch artists",
      },
      { status: 500 },
    );
  }
}
