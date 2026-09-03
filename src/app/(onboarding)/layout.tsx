import { QueryProvider } from "@/providers/query-provider";

/**
 * Onboarding is private and session-bound — always dynamic.
 */
export const dynamic = "force-dynamic";

export default function OnboardingGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <QueryProvider>{children}</QueryProvider>;
}
