import { NextResponse } from "next/server";

import { buildHomeRecommendations } from "@/connections/deezer.recommendations";
import { requireUserId } from "@/lib/auth-session";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const data = await buildHomeRecommendations(userId);
    return NextResponse.json({ status: 200, data });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load recommendations",
      },
      { status: 500 },
    );
  }
}
