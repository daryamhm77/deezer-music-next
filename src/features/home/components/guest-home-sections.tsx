import Link from "next/link";

import {
  getExploreArtists,
  getExploreGenres,
  getExploreSongs,
} from "@/connections/deezer.explore";
import {
  ExploreSectionSkeleton,
  GuestArtistsGrid,
  GuestGenresGrid,
  GuestSongsGrid,
  homeMessages,
} from "@/features/home/components/guest-home-grids";
import { PATHS } from "@/routes/paths";

export function GuestHomeIntro() {
  return (
    <p className="text-sm text-secondary-text">
      {homeMessages.loginPrompt}{" "}
      <Link href={PATHS.login} className="text-primary underline" prefetch>
        Log in
      </Link>
    </p>
  );
}

/** Async RSC — streams independently under Suspense. */
export async function GuestSongsSection() {
  const songs = await getExploreSongs();

  return (
    <section>
      <h2 className="mb-4 text-2xl text-white">{homeMessages.topSongs}</h2>
      <GuestSongsGrid songs={songs} />
    </section>
  );
}

export async function GuestGenresSection() {
  const genres = await getExploreGenres();

  return (
    <section>
      <h2 className="mb-4 text-2xl text-white">{homeMessages.topGenres}</h2>
      <GuestGenresGrid genres={genres} />
    </section>
  );
}

export async function GuestArtistsSection() {
  const artists = await getExploreArtists();

  return (
    <section>
      <h2 className="mb-4 text-2xl text-white">{homeMessages.topSingers}</h2>
      <GuestArtistsGrid artists={artists} />
    </section>
  );
}

export { ExploreSectionSkeleton };
