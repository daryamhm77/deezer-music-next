import { NextResponse } from "next/server";

import {
  deletePlaylist,
  getPlaylist,
} from "@/connections/library.repository";
import { requireUserId } from "@/lib/auth-session";

/** Session / mutation data — never cache across users. */
export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const data = await getPlaylist(userId, id);

  if (!data) {
    return NextResponse.json(
      { status: 404, message: "Playlist not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: 200, data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const deleted = await deletePlaylist(userId, id);

  if (!deleted) {
    return NextResponse.json(
      { status: 404, message: "Playlist not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: 200, data: { id } });
}
