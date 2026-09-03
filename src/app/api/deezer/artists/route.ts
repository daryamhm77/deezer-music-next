import { NextResponse } from "next/server";

import {
  getChartArtists,
  searchDeezerArtists,
} from "@/connections/deezer.artists";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";

/** Used by onboarding client; chart list time-cached at deezerFetch layer. */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = rateLimit(`deezer:artists:${clientKeyFromRequest(request)}`, 45);
  if (!limited.ok) {
    return NextResponse.json(
      { status: 429, message: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((limited.resetAt - Date.now()) / 1000)),
          ),
        },
      },
    );
  }

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
