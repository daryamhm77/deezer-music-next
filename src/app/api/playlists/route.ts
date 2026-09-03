import { NextResponse } from "next/server";

import {
  createPlaylist,
  listPlaylists,
} from "@/connections/library.repository";
import { CreatePlaylistSchema } from "@/contracts";
import { privateJson } from "@/lib/http";
import { requireUserId } from "@/lib/auth-session";

/** Session / mutation data — never cache across users. */
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return privateJson({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  const data = await listPlaylists(userId);
  return privateJson({ status: 200, data });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return privateJson({ status: 401, message: "Unauthorized" }, { status: 401 });
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

  return privateJson({ status: 200, data });
}
