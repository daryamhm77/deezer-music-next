"use client";

import Link from "next/link";

import { SongListRow } from "@/features/library/components/song-list-row";
import { useFavoriteSongsQuery } from "@/features/library/apis";
import { useSession } from "@/lib/auth-client";
import libraryMessages from "@/messages/en/library.json";
import { usePlayer } from "@/providers/player-provider";
import { PATHS } from "@/routes/paths";

export function FavoriteSongsFeature() {
  const { data: session, isPending } = useSession();
  const { data: songs, isLoading } = useFavoriteSongsQuery(Boolean(session));
  const { playSong } = usePlayer();

  if (isPending || isLoading) {
    return <p className="text-secondary-text">Loading...</p>;
  }

  if (!session) {
    return (
      <p className="text-secondary-text">
        {libraryMessages.loginRequired}{" "}
        <Link href={PATHS.login} className="text-primary underline">
          Log in
        </Link>
      </p>
    );
  }

  if (!songs || songs.length === 0) {
    return <p className="text-secondary-text">{libraryMessages.emptyFavorites}</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">
        {libraryMessages.favoriteSongsTitle}
      </h1>
      <div className="space-y-1">
        {songs.map((song, index) => (
          <SongListRow
            key={song.id}
            song={song}
            onPlay={() => playSong(songs, index)}
            removeMode="favorite"
            showAddToPlaylist
          />
        ))}
      </div>
    </div>
  );
}
