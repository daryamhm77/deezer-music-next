"use client";

import Image from "next/image";
import { IoMdPlay } from "react-icons/io";

import type { Artist, Genre, Song } from "@/contracts";
import {
  ARTIST_IMAGE_SIZES,
  GENRE_IMAGE_SIZES,
  IMAGE_BLUR_DATA_URL,
  SONG_COVER_SIZES,
} from "@/lib/image";
import homeMessages from "@/messages/en/home.json";
import { usePlayer } from "@/providers/player-provider";

export function GuestSongsGrid({ songs }: { songs: Song[] }) {
  const { playSong } = usePlayer();

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {songs.map((song, index) => (
        <button
          key={song.id}
          type="button"
          onClick={() => playSong(songs, index)}
          className="group relative cursor-pointer rounded-md bg-background p-3 text-left hover:bg-hover"
        >
          <span className="absolute top-5 left-5 z-10 rounded bg-black/60 px-2 py-0.5 text-xs font-bold text-white">
            #{index + 1}
          </span>
          <span className="absolute right-5 bottom-16 grid h-10 w-10 place-items-center rounded-full bg-primary opacity-0 transition group-hover:opacity-100">
            <IoMdPlay className="text-white" size={18} />
          </span>
          <Image
            src={song.cover_image_url}
            alt={song.title}
            width={400}
            height={400}
            sizes={SONG_COVER_SIZES}
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            priority={index === 0}
            className="h-40 w-full rounded-md object-cover"
          />
          <p className="mt-2 truncate font-semibold text-primary-text">
            {song.title}
          </p>
          <p className="truncate text-sm text-secondary-text">{song.artist}</p>
          <a
            href={song.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block truncate text-xs font-normal text-primary hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            Open on Deezer
          </a>
        </button>
      ))}
    </div>
  );
}

export function GuestGenresGrid({ genres }: { genres: Genre[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {genres.map((genre) => (
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
              sizes={GENRE_IMAGE_SIZES}
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
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
  );
}

export function GuestArtistsGrid({ artists }: { artists: Artist[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {artists.map((artist, index) => (
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
              sizes={ARTIST_IMAGE_SIZES}
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
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
  );
}

export function ExploreSectionSkeleton({ title }: { title: string }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl text-white">{title}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-md bg-hover" />
        ))}
      </div>
    </section>
  );
}

export { homeMessages };
