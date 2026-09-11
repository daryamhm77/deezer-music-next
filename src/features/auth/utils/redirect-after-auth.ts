import { authClient } from "@/lib/auth-client";
import { PATHS } from "@/routes/paths";

type AuthRedirectMode = "sign-up" | "sign-in";

async function waitForSession(attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    const { data } = await authClient.getSession({
      fetchOptions: { cache: "no-store" },
    });
    if (data?.user) return data;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return null;
}

async function isOnboardingComplete() {
  try {
    const response = await fetch("/api/onboarding/status", {
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) return false;
    const payload = await response.json();
    return (
      payload.status === 200 && Boolean(payload.data?.onboardingCompleted)
    );
  } catch {
    return false;
  }
}

/**
 * One-shot post-auth navigation.
 * Waits for the session cookie, then hard-navigates so the next page
 * sees a logged-in user (avoids “login again” from client race).
 */
export async function redirectAfterAuth(mode: AuthRedirectMode) {
  const session = await waitForSession();
  if (!session?.user) {
    window.location.assign(PATHS.login);
    return;
  }

  if (mode === "sign-up") {
    window.location.assign(PATHS.onboarding);
    return;
  }

  const done = await isOnboardingComplete();
  window.location.assign(done ? PATHS.home : PATHS.onboarding);
}
