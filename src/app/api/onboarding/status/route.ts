import { getUserPreferences } from "@/connections/user-preferences.repository";
import { privateJson } from "@/lib/http";
import { requireUserId } from "@/lib/auth-session";

/** Session / mutation data — never cache across users. */
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return privateJson({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  const preferences = await getUserPreferences(userId);

  return privateJson({
    status: 200,
    data: {
      onboardingCompleted: preferences.onboardingCompleted,
      selectedArtistsCount: preferences.selectedArtists.length,
    },
  });
}
