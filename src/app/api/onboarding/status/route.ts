import { NextResponse } from "next/server";

import { getUserPreferences } from "@/connections/user-preferences.repository";
import { requireUserId } from "@/lib/auth-session";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const preferences = await getUserPreferences(userId);

  return NextResponse.json({
    status: 200,
    data: {
      onboardingCompleted: preferences.onboardingCompleted,
      selectedArtistsCount: preferences.selectedArtists.length,
    },
  });
}
