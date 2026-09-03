import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

import {
  getMongoClient,
  getMongoDb,
  resetMongoClient,
} from "@/lib/mongodb";

type Auth = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as unknown as {
  seaAuth?: Auth;
};

function createAuth() {
  const client = getMongoClient();
  const db = getMongoDb();

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: mongodbAdapter(db, {
      client,
      // Standalone Docker Mongo has no replica set — disable transactions.
      transaction: false,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        prompt: "select_account",
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
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
