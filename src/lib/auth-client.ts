import { createAuthClient } from "better-auth/react";

/** Use the current browser origin so Vercel preview/git hosts match the server. */
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
});

export const { signIn, signUp, signOut, useSession } = authClient;
