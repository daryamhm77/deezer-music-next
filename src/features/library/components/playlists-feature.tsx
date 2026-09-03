"use client";

import Link from "next/link";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";

import {
  useCreatePlaylistMutation,
  useDeletePlaylistMutation,
  usePlaylistsQuery,
} from "@/features/library/apis";
import { useSession } from "@/lib/auth-client";
import libraryMessages from "@/messages/en/library.json";
import { PATHS } from "@/routes/paths";

export function PlaylistsFeature() {
  const { data: session, isPending } = useSession();
  const { data: playlists, isLoading } = usePlaylistsQuery(Boolean(session));
  const createPlaylist = useCreatePlaylistMutation();
  const deletePlaylist = useDeletePlaylistMutation();
  const [name, setName] = useState("");

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm text-secondary-text">
            {libraryMessages.playlistName}
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-primary-text outline-none"
            placeholder={libraryMessages.playlistName}
          />
        </div>
        <button
          type="button"
          disabled={createPlaylist.isPending || !name.trim()}
          onClick={async () => {
            await createPlaylist.mutateAsync({ name: name.trim() });
            setName("");
          }}
          className="cursor-pointer rounded-full bg-primary px-6 py-2 font-bold text-white disabled:opacity-60"
        >
          {libraryMessages.create}
        </button>
      </div>

      {playlists && playlists.length > 0 ? (
        <div className="space-y-2">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="flex items-center justify-between rounded-md bg-black/25 px-4 py-3 hover:bg-hover"
            >
              <Link href={PATHS.playlist(playlist.id)} className="flex-1">
                <p className="font-semibold text-primary-text">{playlist.name}</p>
                <p className="text-sm text-secondary-text">
                  {playlist.songs.length} songs
                </p>
              </Link>
              <button
                type="button"
                className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center text-secondary-text hover:text-danger"
                aria-label={libraryMessages.delete}
                onClick={() => deletePlaylist.mutate(playlist.id)}
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-secondary-text">{libraryMessages.emptyFavorites}</p>
      )}
    </div>
  );
}
