"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";

import { SongCardGrid } from "@/features/home/components/song-card-grid";
import { useSearchQuery } from "@/features/search/apis";
import {
  useFavoriteArtistsQuery,
  useToggleFavoriteArtistMutation,
} from "@/features/library/apis";
import { useSession } from "@/lib/auth-client";
import libraryMessages from "@/messages/en/library.json";
import navMessages from "@/messages/en/nav.json";
import searchMessages from "@/messages/en/search.json";
import { PATHS } from "@/routes/paths";

function MobileSearchField() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);

  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

  const submit = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) {
      router.replace(PATHS.search);
      return;
    }
    router.push(`${PATHS.search}?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      className="flex h-11 items-center gap-3 rounded-full bg-background px-3 md:hidden"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        submit(value);
      }}
    >
      <IoSearch className="shrink-0 text-primary-text" size={22} />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={navMessages.searchPlaceholder}
        className="h-full w-full bg-transparent text-primary-text outline-none placeholder:text-secondary-text"
        aria-label={navMessages.searchPlaceholder}
        autoComplete="off"
      />
    </form>
  );
}

export function SearchFeature() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const { data: session } = useSession();
  const { data, isLoading, isError, error, isFetching } = useSearchQuery(query);
  const { data: favoriteArtists } = useFavoriteArtistsQuery(Boolean(session));
  const toggleFavoriteArtist = useToggleFavoriteArtistMutation();

  const favoriteIds = useMemo(
    () => new Set(favoriteArtists?.map((artist) => artist.id) ?? []),
    [favoriteArtists],
  );

  if (!query) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold text-white">
          {searchMessages.title}
        </h1>
        <MobileSearchField />
        <p className="mt-4 text-secondary-text">{searchMessages.emptyPrompt}</p>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="space-y-8 p-4">
        <div className="h-8 w-48 animate-pulse rounded bg-hover" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-md bg-hover" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <h2 className="text-2xl text-white">
          {error instanceof Error ? error.message : searchMessages.loadError}
        </h2>
      </div>
    );
  }

  const songs = data?.songs ?? [];
  const artists = data?.artists ?? [];
  const hasResults = songs.length > 0 || artists.length > 0;

  if (!hasResults) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white">
          {searchMessages.noResults.replace("{query}", query)}
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-4 font-semibold">
      <MobileSearchField />
      <h1 className="text-2xl text-white">
        {searchMessages.title}:{" "}
        <span className="text-primary">{query}</span>
      </h1>

      {songs.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl text-white">{searchMessages.songs}</h2>
          <SongCardGrid songs={songs} />
        </section>
      ) : null}

      {artists.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl text-white">{searchMessages.artists}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {artists.map((artist) => {
              const isFavorite = favoriteIds.has(artist.id);
              return (
                <div
                  key={artist.id}
                  className="rounded-md bg-background p-4 text-center hover:bg-hover"
                >
                  {artist.image_url ? (
                    <Image
                      src={artist.image_url}
                      alt={artist.name}
                      width={200}
                      height={200}
                      className="mx-auto h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-hover text-3xl font-bold text-primary">
                      {artist.name.slice(0, 1)}
                    </div>
                  )}
                  <p className="mt-3 truncate font-semibold text-primary-text">
                    {artist.name}
                  </p>
                  {session ? (
                    <button
                      type="button"
                      className="mt-2 inline-flex cursor-pointer items-center gap-1 text-sm text-secondary-text hover:text-primary"
                      aria-label={
                        isFavorite
                          ? libraryMessages.unfavoriteArtist
                          : libraryMessages.favoriteArtist
                      }
                      onClick={() =>
                        toggleFavoriteArtist.mutate({
                          artist,
                          isFavorite,
                        })
                      }
                    >
                      <FaUserPlus
                        size={12}
                        className={isFavorite ? "text-primary" : ""}
                      />
                      {isFavorite
                        ? searchMessages.following
                        : searchMessages.follow}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
