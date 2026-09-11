"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useOnboardingStatusQuery } from "@/features/onboarding/apis";
import { authClient, useSession } from "@/lib/auth-client";
import { PATHS } from "@/routes/paths";

type OnboardingGateProps = {
  children: React.ReactNode;
};

type AuthCheck = "pending" | "user" | "guest";

/**
 * Private-route gate: incomplete onboarding → /onboarding; done → stay.
 * Re-fetches session once before treating the visitor as a guest (signup race).
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: sessionPending } = useSession();
  const [authCheck, setAuthCheck] = useState<AuthCheck>("pending");

  const isLoggedIn = authCheck === "user";
  const { data: status, isPending: statusPending } = useOnboardingStatusQuery(
    isLoggedIn,
  );

  const isOnboardingRoute = pathname === PATHS.onboarding;

  useEffect(() => {
    if (sessionPending) return;

    if (session?.user) {
      setAuthCheck("user");
      return;
    }

    let cancelled = false;

    void authClient
      .getSession({ fetchOptions: { cache: "no-store" } })
      .then(({ data }) => {
        if (cancelled) return;
        setAuthCheck(data?.user ? "user" : "guest");
      })
      .catch(() => {
        if (!cancelled) setAuthCheck("guest");
      });

    return () => {
      cancelled = true;
    };
  }, [session, sessionPending]);

  useEffect(() => {
    if (authCheck === "pending") return;

    if (authCheck === "guest") {
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
  }, [authCheck, status, statusPending, isOnboardingRoute, router]);

  if (authCheck === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center text-secondary-text">
        Checking session...
      </div>
    );
  }

  if (authCheck === "guest") {
    if (isOnboardingRoute) {
      return (
        <div className="flex min-h-screen items-center justify-center text-secondary-text">
          Redirecting to login...
        </div>
      );
    }
    return children;
  }

  if (statusPending || !status) {
    return children;
  }

  if (!status.onboardingCompleted && !isOnboardingRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center text-secondary-text">
        Redirecting to setup...
      </div>
    );
  }

  if (status.onboardingCompleted && isOnboardingRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center text-secondary-text">
        Redirecting home...
      </div>
    );
  }

  return children;
}
