"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { FaUserPlus } from "react-icons/fa";
import { IoMdPlay } from "react-icons/io";

import { useHomeRecommendationsQuery } from "@/features/home/apis";
import { SongCardGrid } from "@/features/home/components/song-card-grid";
import {
  useFavoriteArtistsQuery,
  useToggleFavoriteArtistMutation,
} from "@/features/library/apis";
import type { Artist } from "@/contracts";
import homeMessages from "@/messages/en/home.json";
import libraryMessages from "@/messages/en/library.json";
import { usePlayer } from "@/providers/player-provider";
import { PATHS } from "@/routes/paths";

function ArtistGrid({
  artists,
  showFollow = false,
}: {
  artists: Artist[];
  showFollow?: boolean;
}) {
  const { data: favoriteArtists } = useFavoriteArtistsQuery(true);
  const toggleFavoriteArtist = useToggleFavoriteArtistMutation();
  const favoriteIds = useMemo(
    () => new Set(favoriteArtists?.map((artist) => artist.id) ?? []),
    [favoriteArtists],
  );

  return (
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
            {showFollow ? (
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
                  ? homeMessages.followingLabel
                  : homeMessages.followLabel}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function UserHome() {
  const { playSong } = usePlayer();
  const { data, isLoading, isError, error } = useHomeRecommendationsQuery(true);

  if (isLoading) {
    return (
      <div className="space-y-10">
        {[...Array(4)].map((_, section) => (
          <div key={section}>
            <div className="mb-4 h-7 w-48 animate-pulse rounded bg-hover" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
              {[...Array(5)].map((__, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-md bg-hover"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <h2 className="text-center text-2xl text-white">
        {error instanceof Error ? error.message : homeMessages.recommendationsError}
      </h2>
    );
  }

  return (
    <div className="space-y-12">
      {data.playlists.length > 0 ? (
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl text-white">
                {homeMessages.madeForYou}
              </h2>
              <p className="mt-1 text-sm font-normal text-secondary-text">
                {homeMessages.madeForYouSubtitle}
              </p>
            </div>
            <Link
              href={PATHS.playlists}
              className="text-sm font-semibold text-secondary-text hover:text-white"
            >
              {homeMessages.seeAllPlaylists}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {data.playlists.slice(0, 8).map((playlist) => {
              const cover = playlist.songs[0]?.cover_image_url;
              return (
                <Link
                  key={playlist.id}
                  href={PATHS.playlist(playlist.id)}
                  className="group relative rounded-md bg-background p-3 hover:bg-hover"
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt={playlist.name}
                      width={400}
                      height={400}
                      className="h-40 w-full rounded-md object-cover"
                    />
                  ) : (
                    <div className="grid h-40 place-items-center rounded-md bg-hover text-3xl font-bold text-primary">
                      {playlist.name.slice(0, 1)}
                    </div>
                  )}
                  <span className="absolute right-5 bottom-16 grid h-10 w-10 place-items-center rounded-full bg-primary opacity-0 transition group-hover:opacity-100">
                    <IoMdPlay className="text-black" size={18} />
                  </span>
                  <p className="mt-2 truncate font-semibold text-primary-text">
                    {playlist.name}
                  </p>
                  <p className="truncate text-sm font-normal text-secondary-text">
                    {playlist.description ||
                      homeMessages.playlistTrackCount.replace(
                        "{count}",
                        String(playlist.songs.length),
                      )}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {data.recommendedSongs.length > 0 ? (
        <section>
          <h2 className="mb-1 text-2xl text-white">
            {homeMessages.recommendedSongs}
          </h2>
          <p className="mb-4 text-sm font-normal text-secondary-text">
            {homeMessages.recommendedSongsSubtitle}
          </p>
          <SongCardGrid songs={data.recommendedSongs} />
        </section>
      ) : null}

      {data.recommendedArtists.length > 0 ? (
        <section>
          <h2 className="mb-1 text-2xl text-white">
            {homeMessages.recommendedSingers}
          </h2>
          <p className="mb-4 text-sm font-normal text-secondary-text">
            {homeMessages.recommendedSingersSubtitle}
          </p>
          <ArtistGrid artists={data.recommendedArtists} showFollow />
        </section>
      ) : null}

      {data.topGenres.length > 0 ? (
        <section>
          <h2 className="mb-1 text-2xl text-white">
            {homeMessages.genresForYou}
          </h2>
          <p className="mb-4 text-sm font-normal text-secondary-text">
            {homeMessages.genresForYouSubtitle}
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {data.topGenres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                className="cursor-pointer overflow-hidden rounded-md bg-background text-left hover:bg-hover"
                onClick={() => {
                  if (genre.songs.length > 0) {
                    playSong(genre.songs, 0);
                  }
                }}
              >
                {genre.image_url ? (
                  <Image
                    src={genre.image_url}
                    alt={genre.name}
                    width={400}
                    height={400}
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="grid h-36 place-items-center bg-hover text-2xl font-bold text-primary">
                    {genre.name.slice(0, 1)}
                  </div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-primary-text">{genre.name}</p>
                  <p className="text-xs font-normal text-secondary-text">
                    {genre.songs.length > 0
                      ? homeMessages.playGenre
                      : homeMessages.genreEmpty}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {data.following.length > 0 ? (
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl text-white">
                {homeMessages.yourSingers}
              </h2>
              <p className="mt-1 text-sm font-normal text-secondary-text">
                {homeMessages.yourSingersSubtitle}
              </p>
            </div>
            <Link
              href={PATHS.favoriteArtists}
              className="text-sm font-semibold text-secondary-text hover:text-white"
            >
              {homeMessages.seeAll}
            </Link>
          </div>
          <ArtistGrid artists={data.following} />
        </section>
      ) : null}
    </div>
  );
}
