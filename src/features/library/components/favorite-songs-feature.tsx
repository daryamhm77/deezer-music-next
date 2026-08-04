"use client";

import Image from "next/image";

import {
  useFavoriteSongsQuery,
  useToggleFavoriteSongMutation,
} from "@/features/library/apis";
import { useSession } from "@/lib/auth-client";
import libraryMessages from "@/messages/en/library.json";
import { usePlayer } from "@/providers/player-provider";
import Link from "next/link";
import { PATHS } from "@/routes/paths";

export function FavoriteSongsFeature() {
  const { data: session, isPending } = useSession();
  const { data: songs, isLoading } = useFavoriteSongsQuery(Boolean(session));
  const toggleFavoriteSong = useToggleFavoriteSongMutation();
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
    <div className="space-y-2">
      {songs.map((song, index) => (
        <div
          key={song.id}
          className="flex items-center justify-between rounded-md p-2 hover:bg-hover"
        >
          <button
            type="button"
            onClick={() => playSong(songs, index)}
            className="flex flex-1 cursor-pointer items-center gap-3 text-left"
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
          <button
            type="button"
            className="cursor-pointer text-sm text-secondary-text hover:text-danger"
            onClick={() =>
              toggleFavoriteSong.mutate({ song, isFavorite: true })
            }
          >
            {libraryMessages.remove}
          </button>
        </div>
      ))}
    </div>
  );
}
