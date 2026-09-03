import { OnboardingGate } from "@/features/onboarding/components/onboarding-gate";
import { FrontendLayout } from "@/layouts/frontend-layout";
import { PlayerProvider } from "@/providers/player-provider";
import { QueryProvider } from "@/providers/query-provider";

/**
 * Private library chrome: always dynamic (session + user data).
 * Onboarding gate + player/library client islands.
 */
export const dynamic = "force-dynamic";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <OnboardingGate>
        <PlayerProvider>
          <FrontendLayout>{children}</FrontendLayout>
        </PlayerProvider>
      </OnboardingGate>
    </QueryProvider>
  );
}
