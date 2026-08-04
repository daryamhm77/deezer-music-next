"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useOnboardingStatusQuery } from "@/features/onboarding/apis";
import { useSession } from "@/lib/auth-client";
import { PATHS } from "@/routes/paths";

type OnboardingGateProps = {
  children: React.ReactNode;
};

export function OnboardingGate({ children }: OnboardingGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: sessionPending } = useSession();
  const isLoggedIn = Boolean(session);
  const { data: status, isPending: statusPending } = useOnboardingStatusQuery(
    isLoggedIn,
  );

  const isOnboardingRoute = pathname === PATHS.onboarding;

  useEffect(() => {
    if (sessionPending) return;

    if (!isLoggedIn) {
      if (isOnboardingRoute) {
        router.replace(PATHS.login);
      }
      return;
    }

    if (statusPending || !status) return;

    if (!status.onboardingCompleted && !isOnboardingRoute) {
      router.replace(PATHS.onboarding);
      return;
    }

    if (status.onboardingCompleted && isOnboardingRoute) {
      router.replace(PATHS.home);
    }
  }, [
    sessionPending,
    isLoggedIn,
    status,
    statusPending,
    isOnboardingRoute,
    router,
  ]);

  if (sessionPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-secondary-text">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn && isOnboardingRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-secondary-text">
        Redirecting to login...
      </div>
    );
  }

  if (isLoggedIn && (statusPending || !status)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-secondary-text">
        Loading your library...
      </div>
    );
  }

  if (isLoggedIn && status && !status.onboardingCompleted && !isOnboardingRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-secondary-text">
        Redirecting to setup...
      </div>
    );
  }

  if (isLoggedIn && status?.onboardingCompleted && isOnboardingRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-secondary-text">
        Redirecting home...
      </div>
    );
  }

  return children;
}
