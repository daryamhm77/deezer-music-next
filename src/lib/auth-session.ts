import { headers } from "next/headers";

import { auth, resetAuth } from "@/lib/auth";
import { ensureMongoConnected } from "@/lib/mongodb";

function isMongoConnectivityError(error: unknown) {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : String(error);

  return (
    message.includes("Mongo") ||
    message.includes("Topology is closed") ||
    message.includes("ECONNREFUSED") ||
    message.includes("FAILED_TO_GET_SESSION") ||
    message.includes("Server selection")
  );
}

export async function getSession() {
  try {
    await ensureMongoConnected();
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    if (isMongoConnectivityError(error)) {
      resetAuth();
      try {
        await ensureMongoConnected();
        return await auth.api.getSession({
          headers: await headers(),
        });
      } catch (retryError) {
        console.error("[auth] getSession failed after reconnect:", retryError);
        return null;
      }
    }

    console.error("[auth] getSession failed:", error);
    return null;
  }
}

export async function requireUserId() {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  return session.user.id;
}
