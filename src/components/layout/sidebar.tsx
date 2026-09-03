"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaHeart, FaUser } from "react-icons/fa";
import { LuPlus } from "react-icons/lu";
import { MdOutlineLibraryMusic, MdQueueMusic } from "react-icons/md";

import {
  useCreatePlaylistMutation,
  useFavoriteSongsQuery,
  usePlaylistsQuery,
} from "@/features/library/apis";
import { useSession } from "@/lib/auth-client";
import authMessages from "@/messages/en/auth.json";
import sidebarMessages from "@/messages/en/sidebar.json";
import { PATHS } from "@/routes/paths";

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const { data: session, isPending } = useSession();
  const { data: playlists } = usePlaylistsQuery(Boolean(session));
  const { data: favoriteSongs } = useFavoriteSongsQuery(Boolean(session));
  const createPlaylist = useCreatePlaylistMutation();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleCreate = async () => {
    const name = playlistName.trim();
    if (!name) return;

    await createPlaylist.mutateAsync({ name });
    setPlaylistName("");
    setIsCreating(false);
  };

  return (
    <>
      <button
        type="button"
        className="fixed bottom-5 left-5 z-50 grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-black text-white lg:hidden"
        onClick={toggleSidebar}
        aria-label={sidebarMessages.toggleAriaLabel}
        aria-expanded={sidebarOpen}
      >
        <MdOutlineLibraryMusic size={22} />
      </button>

      <aside
        className={`fixed top-15 left-2 z-30 h-[90vh] w-75 overflow-y-auto rounded-lg bg-black/25 p-2 backdrop-blur-sm scrollbar-hide transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {isPending ? (
          <div>
            {[...Array(8)].map((_, index) => (
              <div className="mb-4 flex animate-pulse gap-2" key={index}>
                <div className="h-10 w-10 rounded-md bg-hover" />
                <div className="h-5 w-[80%] rounded-md bg-hover" />
              </div>
            ))}
          </div>
        ) : session ? (
          <>
            <div className="mb-3 flex items-center justify-between p-2 text-primary-text">
              <h2 className="font-bold">{sidebarMessages.title}</h2>
              <button
                type="button"
                onClick={() => setIsCreating((prev) => !prev)}
                aria-label={sidebarMessages.createPlaylistAriaLabel}
                className="cursor-pointer hover:text-secondary-text"
              >
                <LuPlus size={20} />
              </button>
            </div>

            {isCreating ? (
              <div className="mb-3 rounded-lg bg-hover p-3">
                <input
                  value={playlistName}
                  onChange={(event) => setPlaylistName(event.target.value)}
                  placeholder={sidebarMessages.playlistNamePlaceholder}
                  className="mb-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-primary-text outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={createPlaylist.isPending}
                  className="w-full cursor-pointer rounded-full bg-primary py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {sidebarMessages.createPlaylist}
                </button>
              </div>
            ) : null}

            <div className="mb-4 space-y-1">
              <Link
                href={PATHS.favoriteSongs}
                className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-hover"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-gradient-to-br from-burgundy to-accent text-white">
                  <FaHeart size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-primary-text">
                    {sidebarMessages.favoriteSongs}
                  </p>
                  <p className="text-xs text-secondary-text">
                    {sidebarMessages.songsCount.replace(
                      "{count}",
                      String(favoriteSongs?.length ?? 0),
                    )}
                  </p>
                </div>
              </Link>

              <Link
                href={PATHS.favoriteArtists}
                className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-hover"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-hover text-primary">
                  <FaUser size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-primary-text">
                    {sidebarMessages.favoriteArtists}
                  </p>
                </div>
              </Link>

              <Link
                href={PATHS.playlists}
                className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-hover"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-hover text-primary">
                  <MdQueueMusic size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-primary-text">
                    {sidebarMessages.playlists}
                  </p>
                  <p className="text-xs text-secondary-text">
                    {sidebarMessages.playlistsCount.replace(
                      "{count}",
                      String(playlists?.length ?? 0),
                    )}
                  </p>
                </div>
              </Link>
            </div>

            <div className="pb-2">
              <h3 className="mb-2 px-2 text-xs font-bold tracking-wide text-secondary-text uppercase">
                {sidebarMessages.playlists}
              </h3>

              {playlists && playlists.length > 0 ? (
                <div className="space-y-1">
                  {playlists.map((playlist) => (
                    <Link
                      key={playlist.id}
                      href={PATHS.playlist(playlist.id)}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-hover"
                    >
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-hover text-secondary-text">
                        <MdQueueMusic size={22} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-primary-text">
                          {playlist.name}
                        </p>
                        <p className="text-xs text-secondary-text">
                          {sidebarMessages.songsCount.replace(
                            "{count}",
                            String(playlist.songs.length),
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mx-2 rounded-lg bg-hover p-4">
                  <p className="font-bold text-primary-text">
                    {sidebarMessages.emptyTitle}
                  </p>
                  <p className="mt-2 text-sm text-secondary-text">
                    {sidebarMessages.emptyDescription}
                  </p>
                </div>
              )}
            </div>

            {favoriteSongs && favoriteSongs.length > 0 ? (
              <div className="mt-4 pb-2">
                <h3 className="mb-2 px-2 text-xs font-bold tracking-wide text-secondary-text uppercase">
                  {sidebarMessages.favoriteSongs}
                </h3>
                <div className="space-y-1">
                  {favoriteSongs.slice(0, 8).map((song) => (
                    <Link
                      key={song.id}
                      href={PATHS.favoriteSongs}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-hover"
                    >
                      <Image
                        src={song.cover_image_url}
                        alt={song.title}
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-primary-text">
                          {song.title}
                        </p>
                        <p className="truncate text-xs text-secondary-text">
                          {song.artist}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="py-8 text-center">
            <Link
              href={PATHS.login}
              className="rounded-full bg-white px-6 py-2 font-semibold text-black hover:bg-secondary-text"
            >
              {authMessages.logIn}
            </Link>
            <p className="mt-4 text-white">{authMessages.loginToViewLibrary}</p>
          </div>
        )}
      </aside>
    </>
  );
}
