"use client";

import { GuestHome } from "@/features/home/components/guest-home";
import { UserHome } from "@/features/home/components/user-home";
import { useSession } from "@/lib/auth-client";

export function HomeFeature() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mb-4 h-8 w-48 animate-pulse rounded bg-hover" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-md bg-hover" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background p-4 font-semibold">
        <GuestHome />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 font-semibold">
      <UserHome />
    </div>
  );
}
