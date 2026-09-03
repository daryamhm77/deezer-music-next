import { NextResponse } from "next/server";

import { buildHomeRecommendations } from "@/connections/deezer.recommendations";
import { requireUserId } from "@/lib/auth-session";

/**
 * Personalized per user — never ISR / never shared cache.
 * Taste would leak across users if this response were cached globally.
 */
export const dynamic = "force-dynamic";

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
    return NextResponse.json(
      { status: 200, data },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
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
