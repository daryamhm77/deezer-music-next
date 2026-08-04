import { NextResponse } from "next/server";

import { searchDeezerCatalog } from "@/connections/deezer.search";

export async function GET(request: Request) {
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
