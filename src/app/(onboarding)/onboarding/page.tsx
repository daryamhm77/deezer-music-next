import type { Metadata } from "next";

import { OnboardingFeature } from "@/features/onboarding";
import { OnboardingGate } from "@/features/onboarding/components/onboarding-gate";
import { buildPageMetadata } from "@/lib/seo";
import { PATHS } from "@/routes/paths";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Choose artists",
  description: "Pick artists to personalize SeaMusicPlayer.",
  path: PATHS.onboarding,
  index: false,
});

export default function OnboardingPage() {
  return (
    <OnboardingGate>
      <OnboardingFeature />
    </OnboardingGate>
  );
}
