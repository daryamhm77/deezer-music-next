"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FaHeart, FaRegHeart, FaUserPlus } from "react-icons/fa";
import { IoMdPlay } from "react-icons/io";
import { MdPlaylistAdd } from "react-icons/md";

import {
  useAddSongToPlaylistMutation,
  useFavoriteArtistsQuery,
  useFavoriteSongsQuery,
  usePlaylistsQuery,
  useToggleFavoriteArtistMutation,
  useToggleFavoriteSongMutation,
} from "@/features/library/apis";
import type { Song } from "@/contracts";
import { useSession } from "@/lib/auth-client";
import homeMessages from "@/messages/en/home.json";
import libraryMessages from "@/messages/en/library.json";
import { usePlayer } from "@/providers/player-provider";

type SongCardGridProps = {
  songs: Song[];
};

export function SongCardGrid({ songs }: SongCardGridProps) {
  const { playSong } = usePlayer();
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session);
  const { data: favoriteSongs } = useFavoriteSongsQuery(isLoggedIn);
  const { data: favoriteArtists } = useFavoriteArtistsQuery(isLoggedIn);
  const { data: playlists } = usePlaylistsQuery(isLoggedIn);
  const toggleFavoriteSong = useToggleFavoriteSongMutation();
  const toggleFavoriteArtist = useToggleFavoriteArtistMutation();
  const addSongToPlaylist = useAddSongToPlaylistMutation();
  const [playlistMenuSongId, setPlaylistMenuSongId] = useState<string | null>(
    null,
  );

  const favoriteSongIds = useMemo(
    () => new Set(favoriteSongs?.map((song) => song.id) ?? []),
    [favoriteSongs],
  );
  const favoriteArtistIds = useMemo(
    () => new Set(favoriteArtists?.map((artist) => artist.id) ?? []),
    [favoriteArtists],
  );

  if (songs.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {songs.map((song, index) => {
        const isFavoriteSong = favoriteSongIds.has(song.id);
        const isFavoriteArtist = favoriteArtistIds.has(song.artist_id);

        return (
          <div
            key={song.id}
            className="group relative rounded-md bg-background p-3 hover:bg-hover"
          >
            <button
              type="button"
              className="absolute right-5 bottom-8 z-10 grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-primary opacity-0 transition-all duration-300 ease-in-out group-hover:bottom-18 group-hover:opacity-100"
              aria-label={homeMessages.playAriaLabel}
              onClick={() => playSong(songs, index)}
            >
              <IoMdPlay size={22} className="text-black" />
            </button>

            {isLoggedIn ? (
              <div className="absolute top-5 right-5 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-black/70 text-white"
                  aria-label={
                    isFavoriteSong
                      ? libraryMessages.unfavoriteSong
                      : libraryMessages.favoriteSong
                  }
                  onClick={() =>
                    toggleFavoriteSong.mutate({
                      song,
                      isFavorite: isFavoriteSong,
                    })
                  }
                >
                  {isFavoriteSong ? (
                    <FaHeart className="text-primary" size={14} />
                  ) : (
                    <FaRegHeart size={14} />
                  )}
                </button>
                <button
                  type="button"
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-black/70 text-white"
                  aria-label={
                    isFavoriteArtist
                      ? libraryMessages.unfavoriteArtist
                      : libraryMessages.favoriteArtist
                  }
                  onClick={() =>
                    toggleFavoriteArtist.mutate({
                      artist: {
                        id: song.artist_id,
                        name: song.artist,
                        image_url: song.artist_image_url,
                      },
                      isFavorite: isFavoriteArtist,
                    })
                  }
                >
                  <FaUserPlus
                    size={14}
                    className={isFavoriteArtist ? "text-primary" : ""}
                  />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-black/70 text-white"
                    aria-label={libraryMessages.addToPlaylist}
                    onClick={() =>
                      setPlaylistMenuSongId((prev) =>
                        prev === song.id ? null : song.id,
                      )
                    }
                  >
                    <MdPlaylistAdd size={16} />
                  </button>
                  {playlistMenuSongId === song.id && playlists ? (
                    <div className="absolute top-9 right-0 z-20 min-w-40 rounded-md border border-border bg-black py-1 shadow-lg">
                      {playlists.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-secondary-text">
                          {libraryMessages.emptyPlaylist}
                        </p>
                      ) : (
                        playlists.map((playlist) => (
                          <button
                            key={playlist.id}
                            type="button"
                            className="block w-full cursor-pointer px-3 py-2 text-left text-xs text-primary-text hover:bg-hover"
                            onClick={() => {
                              addSongToPlaylist.mutate({
                                playlistId: playlist.id,
                                song,
                              });
                              setPlaylistMenuSongId(null);
                            }}
                          >
                            {playlist.name}
                          </button>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              className="w-full cursor-pointer text-left"
              onClick={() => playSong(songs, index)}
            >
              <Image
                src={song.cover_image_url}
                alt={song.title}
                width={500}
                height={500}
                className="h-50 w-full rounded-md object-cover"
              />
              <div className="mt-2">
                <p className="font-semibold text-primary-text">{song.title}</p>
                <p className="text-sm text-secondary-text">
                  {homeMessages.byArtist.replace("{artist}", song.artist)}
                </p>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
