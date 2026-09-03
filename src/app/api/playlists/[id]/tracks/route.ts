import { NextResponse } from "next/server";

import {
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "@/connections/library.repository";
import { SongSchema } from "@/contracts";
import { requireUserId } from "@/lib/auth-session";

/** Session / mutation data — never cache across users. */
export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = SongSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { status: 500, message: "Invalid song payload" },
      { status: 400 },
    );
  }

  const data = await addSongToPlaylist(userId, id, parsed.data);

  if (!data) {
    return NextResponse.json(
      { status: 404, message: "Playlist not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: 200, data });
}

export async function DELETE(request: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const songId = searchParams.get("songId")?.trim();

  if (!songId) {
    return NextResponse.json(
      { status: 500, message: "songId is required" },
      { status: 400 },
    );
  }

  const data = await removeSongFromPlaylist(userId, id, songId);

  if (!data) {
    return NextResponse.json(
      { status: 404, message: "Playlist not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: 200, data });
}
