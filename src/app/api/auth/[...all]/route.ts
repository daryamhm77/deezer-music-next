import { toNextJsHandler } from "better-auth/next-js";

import { auth, resetAuth } from "@/lib/auth";
import { ensureMongoConnected } from "@/lib/mongodb";

/** Session / mutation data — never cache across users. */
export const dynamic = "force-dynamic";

const handlers = toNextJsHandler(auth);

function isMongoConnectivityError(error: unknown) {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : String(error);

  return (
    message.includes("Mongo") ||
    message.includes("Topology is closed") ||
    message.includes("ECONNREFUSED") ||
    message.includes("Server selection")
  );
}

async function withMongo(
  request: Request,
  handle: (request: Request) => Promise<Response>,
) {
  try {
    await ensureMongoConnected();
    return await handle(request);
  } catch (error) {
    if (!isMongoConnectivityError(error)) {
      throw error;
    }

    resetAuth();
    try {
      await ensureMongoConnected();
      return await handle(request);
    } catch (retryError) {
      console.error("[auth] request failed after Mongo reconnect:", retryError);
      return Response.json(
        { message: "Database unavailable. Is MongoDB running on port 27018?" },
        { status: 503 },
      );
    }
  }
}

export async function GET(request: Request) {
  return withMongo(request, handlers.GET);
}

export async function POST(request: Request) {
  return withMongo(request, handlers.POST);
}
