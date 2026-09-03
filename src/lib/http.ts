import { NextResponse } from "next/server";

/** JSON helper that marks the response as private / uncacheable. */
export function privateJson<T>(
  body: T,
  init?: { status?: number },
) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
