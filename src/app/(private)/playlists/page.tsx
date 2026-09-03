import type { Metadata } from "next";

import { PlaylistsPageFeature } from "@/features/library/playlists";
import { buildPageMetadata } from "@/lib/seo";
import { PATHS } from "@/routes/paths";

/** Private library — always dynamic / CSR. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Playlists",
  description: "Your SeaMusicPlayer playlists.",
  path: PATHS.playlists,
  index: false,
});

export default PlaylistsPageFeature;
