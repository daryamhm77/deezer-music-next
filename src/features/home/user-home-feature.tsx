"use client";

import { UserHome } from "@/features/home/components/user-home";

/** Logged-in home stays CSR — personalized recommendations. */
export function UserHomeFeature() {
  return (
    <div className="min-h-screen p-4 font-semibold">
      <UserHome />
    </div>
  );
}
