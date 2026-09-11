import { createAuthClient } from "better-auth/react";

/**
 * Same-origin client. Do not pin baseURL at module load — Vercel preview/git
 * hosts must match the page the user is on.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
