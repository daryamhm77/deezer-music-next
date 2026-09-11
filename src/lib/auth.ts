import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

import {
  getMongoClient,
  getMongoDb,
  resetMongoClient,
} from "@/lib/mongodb";
import { getSiteUrl, getTrustedOrigins } from "@/lib/seo";

type Auth = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as unknown as {
  seaAuth?: Auth;
};

function requireAuthSecret() {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET must be set (openssl rand -base64 32).",
    );
  }
  return secret;
}

function getGoogleSocialProvider() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return undefined;
  }
  return {
    google: {
      clientId,
      clientSecret,
      prompt: "select_account" as const,
    },
  };
}

function createAuth() {
  const client = getMongoClient();
  const db = getMongoDb();
  const appUrl = getSiteUrl();
  const google = getGoogleSocialProvider();

  return betterAuth({
    secret: requireAuthSecret(),
    baseURL: appUrl,
    trustedOrigins: getTrustedOrigins(),
    database: mongodbAdapter(db, {
      client,
      // Local Docker Mongo has no replica set. Atlas still works with this off.
      transaction: false,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    ...(google ? { socialProviders: google } : {}),
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: google ? ["google"] : [],
      },
    },
    plugins: [nextCookies()],
  });
}

function getAuthInstance() {
  if (!globalForAuth.seaAuth) {
    globalForAuth.seaAuth = createAuth();
  }
  return globalForAuth.seaAuth;
}

/** Recreate auth + Mongo client after a closed topology or refused connection. */
export function resetAuth() {
  globalForAuth.seaAuth = undefined;
  resetMongoClient();
}

/**
 * Lazy auth instance so we can rebuild after Mongo reconnects.
 * Call sites keep using `auth` as before.
 */
export const auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    const instance = getAuthInstance();
    const value = Reflect.get(instance as object, prop, receiver);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(instance)
      : value;
  },
  has(_target, prop) {
    return Reflect.has(getAuthInstance() as object, prop);
  },
});
