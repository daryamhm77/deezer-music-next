"use client";

import Image from "next/image";
import Link from "next/link";
import { IoMdPlay } from "react-icons/io";

import { useExploreQuery } from "@/features/home/apis";
import homeMessages from "@/messages/en/home.json";
import { usePlayer } from "@/providers/player-provider";
import { PATHS } from "@/routes/paths";

export function GuestHome() {
  const { data, isLoading, isError, error } = useExploreQuery();
  const { playSong } = usePlayer();

  if (isLoading) {
    return (
      <div className="space-y-10">
        {[...Array(3)].map((_, section) => (
          <div key={section}>
            <div className="mb-4 h-7 w-40 animate-pulse rounded bg-hover" />
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
        {error instanceof Error ? error.message : homeMessages.exploreError}
      </h2>
    );
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-secondary-text">
        {homeMessages.loginPrompt}{" "}
        <Link href={PATHS.login} className="text-primary underline">
          Log in
        </Link>
      </p>

      <section>
        <h2 className="mb-4 text-2xl text-white">{homeMessages.topSongs}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.songs.map((song, index) => (
            <button
              key={song.id}
              type="button"
              onClick={() => playSong(data.songs, index)}
              className="group relative cursor-pointer rounded-md bg-background p-3 text-left hover:bg-hover"
            >
              <span className="absolute top-5 left-5 z-10 rounded bg-black/60 px-2 py-0.5 text-xs font-bold text-white">
                #{index + 1}
              </span>
              <span className="absolute right-5 bottom-16 grid h-10 w-10 place-items-center rounded-full bg-primary opacity-0 transition group-hover:opacity-100">
                <IoMdPlay className="text-black" size={18} />
              </span>
              <Image
                src={song.cover_image_url}
                alt={song.title}
                width={400}
                height={400}
                className="h-40 w-full rounded-md object-cover"
              />
              <p className="mt-2 truncate font-semibold text-primary-text">
                {song.title}
              </p>
              <p className="truncate text-sm text-secondary-text">
                {song.artist}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl text-white">{homeMessages.topGenres}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.genres.map((genre) => (
            <div
              key={genre.id}
              className="overflow-hidden rounded-md bg-background hover:bg-hover"
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
              <p className="p-3 font-semibold text-primary-text">{genre.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl text-white">{homeMessages.topSingers}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.artists.map((artist, index) => (
            <div
              key={artist.id}
              className="rounded-md bg-background p-4 text-center hover:bg-hover"
            >
              <p className="mb-2 text-xs font-bold text-secondary-text">
                #{index + 1}
              </p>
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
              <p className="mt-3 font-semibold text-primary-text">{artist.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
