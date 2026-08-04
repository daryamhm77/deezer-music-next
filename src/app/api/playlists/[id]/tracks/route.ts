import { NextResponse } from "next/server";

import { addSongToPlaylist } from "@/connections/library.repository";
import { SongSchema } from "@/contracts";
import { requireUserId } from "@/lib/auth-session";

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
