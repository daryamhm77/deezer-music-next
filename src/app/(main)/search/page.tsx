import { Suspense } from "react";

import { SearchFeature } from "@/features/search";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-secondary-text">Loading search...</div>
      }
    >
      <SearchFeature />
    </Suspense>
  );
}
