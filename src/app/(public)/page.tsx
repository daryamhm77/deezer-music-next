import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getExploreSongs } from "@/connections/deezer.explore";
import { getUserPreferences } from "@/connections/user-preferences.repository";
import {
  ExploreSectionSkeleton,
  GuestArtistsSection,
  GuestGenresSection,
  GuestHomeIntro,
  GuestSongsSection,
} from "@/features/home/components/guest-home-sections";
import { UserHomeFeature } from "@/features/home/user-home-feature";
import { getSession } from "@/lib/auth-session";
import { buildPageMetadata, getSiteUrl } from "@/lib/seo";
import homeMessages from "@/messages/en/home.json";
import { PATHS } from "@/routes/paths";

/**
 * Public home (SSR + streaming).
 * Guest sections stream independently; logged-in recommendations stay CSR.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const songs = await getExploreSongs(5);
    const topSong = songs[0];

    return buildPageMetadata({
      title: "Discover music",
      description:
        "Browse top songs, genres, and singers. Log in for playlists and personal recommendations.",
      path: PATHS.home,
      image: topSong?.cover_image_url,
      imageAlt: topSong
        ? `${topSong.title} by ${topSong.artist}`
        : "SeaMusicPlayer",
    });
  } catch {
    return buildPageMetadata({
      title: "Discover music",
      description: "Browse top songs, genres, and singers on SeaMusicPlayer.",
      path: PATHS.home,
    });
  }
}

export default async function HomePage() {
  const session = await getSession();

  if (session?.user) {
    const preferences = await getUserPreferences(session.user.id);
    if (!preferences.onboardingCompleted) {
      redirect(PATHS.onboarding);
    }
    return <UserHomeFeature />;
  }

  const site = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SeaMusicPlayer",
    url: site,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site}${PATHS.search}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen space-y-10 p-4 font-semibold">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuestHomeIntro />
      <Suspense
        fallback={<ExploreSectionSkeleton title={homeMessages.topSongs} />}
      >
        <GuestSongsSection />
      </Suspense>
      <Suspense
        fallback={<ExploreSectionSkeleton title={homeMessages.topGenres} />}
      >
        <GuestGenresSection />
      </Suspense>
      <Suspense
        fallback={<ExploreSectionSkeleton title={homeMessages.topSingers} />}
      >
        <GuestArtistsSection />
      </Suspense>
    </div>
  );
}
