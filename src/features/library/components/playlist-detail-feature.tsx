"use client";

import Image from "next/image";

import { usePlaylistQuery } from "@/features/library/apis";
import libraryMessages from "@/messages/en/library.json";
import { usePlayer } from "@/providers/player-provider";

type PlaylistDetailFeatureProps = {
  playlistId: string;
};

export function PlaylistDetailFeature({
  playlistId,
}: PlaylistDetailFeatureProps) {
  const { data: playlist, isLoading, isError, error } =
    usePlaylistQuery(playlistId);
  const { playSong } = usePlayer();

  if (isLoading) {
    return <p className="text-secondary-text">Loading...</p>;
  }

  if (isError || !playlist) {
    return (
      <p className="text-secondary-text">
        {error instanceof Error ? error.message : "Playlist not found"}
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">{playlist.name}</h1>
      <p className="mb-6 text-secondary-text">{playlist.songs.length} songs</p>

      {playlist.songs.length === 0 ? (
        <p className="text-secondary-text">{libraryMessages.emptyPlaylist}</p>
      ) : (
        <div className="space-y-2">
          {playlist.songs.map((song, index) => (
            <button
              key={song.id}
              type="button"
              onClick={() => playSong(playlist.songs, index)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left hover:bg-hover"
            >
              <Image
                src={song.cover_image_url}
                alt={song.title}
                width={56}
                height={56}
                className="h-14 w-14 rounded-md object-cover"
              />
              <div>
                <p className="font-semibold text-primary-text">{song.title}</p>
                <p className="text-sm text-secondary-text">{song.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
