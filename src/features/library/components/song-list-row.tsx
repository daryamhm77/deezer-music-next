"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FaHeart, FaRegHeart, FaTrash } from "react-icons/fa";
import { MdPlaylistAdd } from "react-icons/md";

import {
  OpenInDeezerButton,
  ShareButton,
} from "@/components/shared/share-actions";
import {
  useAddSongToPlaylistMutation,
  useFavoriteSongsQuery,
  usePlaylistsQuery,
  useRemoveSongFromPlaylistMutation,
  useToggleFavoriteSongMutation,
} from "@/features/library/apis";
import type { Song } from "@/contracts";
import libraryMessages from "@/messages/en/library.json";
import shareMessages from "@/messages/en/share.json";
import { buildSongSharePayload } from "@/utils/share";

type SongListRowProps = {
  song: Song;
  onPlay: () => void;
  removeMode?: "favorite" | "playlist";
  playlistId?: string;
  showFavorite?: boolean;
  showAddToPlaylist?: boolean;
};

export function SongListRow({
  song,
  onPlay,
  removeMode,
  playlistId,
  showFavorite = false,
  showAddToPlaylist = false,
}: SongListRowProps) {
  const { data: favoriteSongs } = useFavoriteSongsQuery(true);
  const { data: playlists } = usePlaylistsQuery(true);
  const toggleFavoriteSong = useToggleFavoriteSongMutation();
  const addSongToPlaylist = useAddSongToPlaylistMutation();
  const removeSongFromPlaylist = useRemoveSongFromPlaylistMutation();
  const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false);

  const isFavorite = useMemo(
    () => Boolean(favoriteSongs?.some((item) => item.id === song.id)),
    [favoriteSongs, song.id],
  );

  const targetPlaylists = useMemo(() => {
    if (!playlists) return [];
    if (!playlistId) return playlists;
    return playlists.filter((playlist) => playlist.id !== playlistId);
  }, [playlists, playlistId]);

  const handleRemove = () => {
    if (removeMode === "favorite") {
      toggleFavoriteSong.mutate({ song, isFavorite: true });
      return;
    }

    if (removeMode === "playlist" && playlistId) {
      removeSongFromPlaylist.mutate({ playlistId, songId: song.id });
    }
  };

  return (
    <div className="group flex items-center gap-3 rounded-md p-2 hover:bg-hover">
      <button
        type="button"
        onClick={onPlay}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
      >
        <Image
          src={song.cover_image_url}
          alt={song.title}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-md object-cover"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold text-primary-text">{song.title}</p>
          <p className="truncate text-sm text-secondary-text">{song.artist}</p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
        {showFavorite ? (
          <button
            type="button"
            className="grid h-8 w-8 cursor-pointer place-items-center text-secondary-text hover:text-white"
            aria-label={
              isFavorite
                ? libraryMessages.unfavoriteSong
                : libraryMessages.favoriteSong
            }
            onClick={() => toggleFavoriteSong.mutate({ song, isFavorite })}
          >
            {isFavorite ? (
              <FaHeart size={16} className="text-primary" />
            ) : (
              <FaRegHeart size={16} />
            )}
          </button>
        ) : null}

        {showAddToPlaylist ? (
          <div className="relative">
            <button
              type="button"
              className="grid h-8 w-8 cursor-pointer place-items-center text-secondary-text hover:text-white"
              aria-label={libraryMessages.addToPlaylist}
              onClick={() => setPlaylistMenuOpen((prev) => !prev)}
            >
              <MdPlaylistAdd size={20} />
            </button>
            {playlistMenuOpen ? (
              <div className="absolute top-9 right-0 z-20 min-w-44 rounded-md border border-border bg-black py-1 shadow-lg">
                {targetPlaylists.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-secondary-text">
                    {libraryMessages.emptyPlaylist}
                  </p>
                ) : (
                  targetPlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      type="button"
                      className="block w-full cursor-pointer px-3 py-2 text-left text-xs text-primary-text hover:bg-hover"
                      onClick={() => {
                        addSongToPlaylist.mutate({
                          playlistId: playlist.id,
                          song,
                        });
                        setPlaylistMenuOpen(false);
                      }}
                    >
                      {playlist.name}
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        <OpenInDeezerButton url={song.external_url} compact />
        <ShareButton
          compact
          {...buildSongSharePayload(song)}
          label={shareMessages.shareSong}
        />

        {removeMode ? (
          <button
            type="button"
            className="grid h-8 w-8 cursor-pointer place-items-center text-secondary-text hover:text-danger"
            aria-label={libraryMessages.remove}
            onClick={handleRemove}
          >
            <FaTrash size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
