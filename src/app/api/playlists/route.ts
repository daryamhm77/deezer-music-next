import { NextResponse } from "next/server";

import {
  createPlaylist,
  listPlaylists,
} from "@/connections/library.repository";
import { CreatePlaylistSchema } from "@/contracts";
import { requireUserId } from "@/lib/auth-session";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const data = await listPlaylists(userId);
  return NextResponse.json({ status: 200, data });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = CreatePlaylistSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { status: 500, message: "Invalid playlist payload" },
      { status: 400 },
    );
  }

  const data = await createPlaylist(
    userId,
    parsed.data.name,
    parsed.data.description,
  );

  return NextResponse.json({ status: 200, data });
}
