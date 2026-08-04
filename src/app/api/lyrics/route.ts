import { NextResponse } from "next/server";

type LrcLibResult = {
  id: number;
  trackName: string;
  artistName: string;
  plainLyrics: string | null;
  syncedLyrics: string | null;
  instrumental: boolean;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.trim();
  const artist = searchParams.get("artist")?.trim();

  if (!title || !artist) {
    return NextResponse.json(
      { status: 500, message: "title and artist are required" },
      { status: 400 },
    );
  }

  try {
    const url = new URL("https://lrclib.net/api/search");
    url.searchParams.set("track_name", title);
    url.searchParams.set("artist_name", artist);

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "SeaMusicPlayer/1.0 (lyrics lookup)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Lyrics provider error (${response.status})`);
    }

    const results = (await response.json()) as LrcLibResult[];
    const match =
      results.find((item) => item.plainLyrics || item.syncedLyrics) ??
      results[0];

    if (!match) {
      return NextResponse.json({
        status: 200,
        data: {
          lyrics: null,
          instrumental: false,
          found: false,
        },
      });
    }

    if (match.instrumental) {
      return NextResponse.json({
        status: 200,
        data: {
          lyrics: null,
          instrumental: true,
          found: true,
        },
      });
    }

    const lyrics =
      match.plainLyrics ||
      match.syncedLyrics
        ?.split("\n")
        .map((line) => line.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]\s*/g, ""))
        .join("\n") ||
      null;

    return NextResponse.json({
      status: 200,
      data: {
        lyrics,
        instrumental: false,
        found: Boolean(lyrics),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message:
          error instanceof Error ? error.message : "Failed to fetch lyrics",
      },
      { status: 500 },
    );
  }
}
