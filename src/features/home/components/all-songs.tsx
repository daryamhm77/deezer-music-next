"use client";

import { useGetSongsQuery } from "@/features/home/apis";
import { SongCardGrid } from "@/features/home/components/song-card-grid";
import type { Song } from "@/features/home/types";
import homeMessages from "@/messages/en/home.json";

export function AllSongs() {
  const { data: songs, isLoading, isError, error } = useGetSongsQuery();

  if (isLoading) {
    return (
      <div className="grid animate-pulse grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {[...Array(15)].map((_, index) => (
          <div key={index}>
            <div className="mb-2 h-50 w-full rounded-md bg-hover object-cover" />
            <div className="h-3 w-[80%] rounded-md bg-hover" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <h2 className="text-center text-2xl text-white">
        {error instanceof Error ? error.message : homeMessages.loadError}
      </h2>
    );
  }

  return <SongCardGrid songs={songs ?? []} />;
}

export type { Song };
