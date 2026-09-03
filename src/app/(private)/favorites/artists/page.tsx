import type { Metadata } from "next";

import { FavoriteArtistsPageFeature } from "@/features/library/favorite-artists";
import { buildPageMetadata } from "@/lib/seo";
import { PATHS } from "@/routes/paths";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Favorite singers",
  description: "Singers you follow on SeaMusicPlayer.",
  path: PATHS.favoriteArtists,
  index: false,
});

export default FavoriteArtistsPageFeature;
