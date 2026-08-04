import { OnboardingFeature } from "@/features/onboarding";
import { OnboardingGate } from "@/features/onboarding/components/onboarding-gate";

export default function OnboardingPage() {
  return (
    <OnboardingGate>
      <OnboardingFeature />
    </OnboardingGate>
  );
}
