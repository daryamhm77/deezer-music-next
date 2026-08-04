"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useFavoriteArtistsQuery,
  useToggleFavoriteArtistMutation,
} from "@/features/library/apis";
import { useSession } from "@/lib/auth-client";
import libraryMessages from "@/messages/en/library.json";
import { PATHS } from "@/routes/paths";

export function FavoriteArtistsFeature() {
  const { data: session, isPending } = useSession();
  const { data: artists, isLoading } = useFavoriteArtistsQuery(Boolean(session));
  const toggleFavoriteArtist = useToggleFavoriteArtistMutation();

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

  if (!artists || artists.length === 0) {
    return <p className="text-secondary-text">{libraryMessages.emptyFavorites}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {artists.map((artist) => (
        <div
          key={artist.id}
          className="rounded-md bg-background p-4 text-center hover:bg-hover"
        >
          {artist.image_url ? (
            <Image
              src={artist.image_url}
              alt={artist.name}
              width={160}
              height={160}
              className="mx-auto h-32 w-32 rounded-full object-cover"
            />
          ) : (
            <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-hover text-3xl font-bold text-primary">
              {artist.name.slice(0, 1)}
            </div>
          )}
          <p className="mt-3 font-semibold text-primary-text">{artist.name}</p>
          <button
            type="button"
            className="mt-2 cursor-pointer text-sm text-secondary-text hover:text-danger"
            onClick={() =>
              toggleFavoriteArtist.mutate({ artist, isFavorite: true })
            }
          >
            {libraryMessages.remove}
          </button>
        </div>
      ))}
    </div>
  );
}
