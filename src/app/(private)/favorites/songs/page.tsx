import type { Metadata } from "next";

import { FavoriteSongsPageFeature } from "@/features/library/favorite-songs";
import { buildPageMetadata } from "@/lib/seo";
import { PATHS } from "@/routes/paths";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Favorite songs",
  description: "Your favorite songs on SeaMusicPlayer.",
  path: PATHS.favoriteSongs,
  index: false,
});

export default FavoriteSongsPageFeature;
