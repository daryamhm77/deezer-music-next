import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireUserId() {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  return session.user.id;
}
