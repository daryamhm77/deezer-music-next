import { NextResponse } from "next/server";

import {
  addFavoriteArtist,
  listFavoriteArtists,
  removeFavoriteArtist,
} from "@/connections/library.repository";
import { ArtistSchema } from "@/contracts";
import { privateJson } from "@/lib/http";
import { requireUserId } from "@/lib/auth-session";

/** Session / mutation data — never cache across users. */
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return privateJson({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  const data = await listFavoriteArtists(userId);
  return privateJson({ status: 200, data });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return privateJson({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ArtistSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { status: 500, message: "Invalid artist payload" },
      { status: 400 },
    );
  }

  const data = await addFavoriteArtist(userId, parsed.data);
  return privateJson({ status: 200, data });
}

export async function DELETE(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return privateJson({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artistId");

  if (!artistId) {
    return NextResponse.json(
      { status: 500, message: "artistId is required" },
      { status: 400 },
    );
  }

  await removeFavoriteArtist(userId, artistId);
  return privateJson({ status: 200, data: { artistId } });
}
