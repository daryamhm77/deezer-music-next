import { OnboardingGate } from "@/features/onboarding/components/onboarding-gate";
import { FrontendLayout } from "@/layouts/frontend-layout";
import { PlayerProvider } from "@/providers/player-provider";
import { QueryProvider } from "@/providers/query-provider";

export default function MainLayout({
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
