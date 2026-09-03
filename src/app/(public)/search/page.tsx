import type { Metadata } from "next";

import { searchDeezerCatalog } from "@/connections/deezer.search";
import { SearchFeature } from "@/features/search";
import { buildPageMetadata } from "@/lib/seo";
import { PATHS } from "@/routes/paths";

/** Search is always SSR (query-dependent). Deezer search is not cached. */
export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return buildPageMetadata({
      title: "Search",
      description: "Search songs and singers on SeaMusicPlayer.",
      path: PATHS.search,
    });
  }

  try {
    const results = await searchDeezerCatalog(query);
    const cover =
      results.songs[0]?.cover_image_url || results.artists[0]?.image_url;

    return buildPageMetadata({
      title: `Search “${query}”`,
      description: `Songs and singers matching “${query}” on SeaMusicPlayer.`,
      path: `${PATHS.search}?q=${encodeURIComponent(query)}`,
      image: cover,
      imageAlt: results.songs[0]
        ? `${results.songs[0].title} by ${results.songs[0].artist}`
        : results.artists[0]?.name || query,
    });
  } catch {
    return buildPageMetadata({
      title: `Search “${query}”`,
      description: `Results for ${query} on SeaMusicPlayer.`,
      path: `${PATHS.search}?q=${encodeURIComponent(query)}`,
    });
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const initialData = query ? await searchDeezerCatalog(query) : null;

  return <SearchFeature query={query} initialData={initialData} />;
}
