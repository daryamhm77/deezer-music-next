import { NextResponse } from "next/server";

import { getExploreCatalog } from "@/connections/deezer.explore";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";

/** Cached Deezer catalog for thin clients; RSC prefers connections/* directly. */
export const revalidate = 60;

export async function GET(request: Request) {
  const limited = rateLimit(`deezer:explore:${clientKeyFromRequest(request)}`, 60);
  if (!limited.ok) {
    return NextResponse.json(
      { status: 429, message: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((limited.resetAt - Date.now()) / 1000)),
          ),
        },
      },
    );
  }

  try {
    const data = await getExploreCatalog();
    return NextResponse.json({ status: 200, data });
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message:
          error instanceof Error ? error.message : "Failed to fetch explore data",
      },
      { status: 500 },
    );
  }
}
