import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getUserPreferences } from "@/connections/user-preferences.repository";
import { OnboardingFeature } from "@/features/onboarding";
import { getSession } from "@/lib/auth-session";
import { buildPageMetadata } from "@/lib/seo";
import { PATHS } from "@/routes/paths";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Choose artists",
  description: "Pick artists to personalize SeaMusicPlayer.",
  path: PATHS.onboarding,
  index: false,
});

/** Server-gated: session required; completed users skip to home. */
export default async function OnboardingPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect(PATHS.login);
  }

  const preferences = await getUserPreferences(session.user.id);
  if (preferences.onboardingCompleted) {
    redirect(PATHS.home);
  }

  return <OnboardingFeature />;
}
