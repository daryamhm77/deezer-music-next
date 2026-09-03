import { NextResponse } from "next/server";

import {
  addFavoriteSong,
  listFavoriteSongs,
  removeFavoriteSong,
} from "@/connections/library.repository";
import { SongSchema } from "@/contracts";
import { privateJson } from "@/lib/http";
import { requireUserId } from "@/lib/auth-session";

/** Session / mutation data — never cache across users. */
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return privateJson({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  const data = await listFavoriteSongs(userId);
  return privateJson({ status: 200, data });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return privateJson({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = SongSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { status: 500, message: "Invalid song payload" },
      { status: 400 },
    );
  }

  const data = await addFavoriteSong(userId, parsed.data);
  return privateJson({ status: 200, data });
}

export async function DELETE(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return privateJson({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const songId = searchParams.get("songId");

  if (!songId) {
    return NextResponse.json(
      { status: 500, message: "songId is required" },
      { status: 400 },
    );
  }

  await removeFavoriteSong(userId, songId);
  return privateJson({ status: 200, data: { songId } });
}
