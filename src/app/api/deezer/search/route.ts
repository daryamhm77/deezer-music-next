import { NextResponse } from "next/server";

import { searchDeezerCatalog } from "@/connections/deezer.search";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";

/** Query-specific — never ISR. Prefer server search via connections/* on /search. */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = rateLimit(`deezer:search:${clientKeyFromRequest(request)}`, 45);
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

  if (!query) {
    return NextResponse.json({
      status: 200,
      data: { songs: [], artists: [] },
    });
  }

  try {
    const data = await searchDeezerCatalog(query);
    return NextResponse.json({ status: 200, data });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message:
          error instanceof Error ? error.message : "Failed to search music",
      },
      { status: 500 },
    );
  }
}
