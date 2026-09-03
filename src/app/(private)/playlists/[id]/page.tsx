import type { Metadata } from "next";

import { PlaylistPageFeature } from "@/features/library/playlist-detail";
import { buildPageMetadata } from "@/lib/seo";
import { PATHS } from "@/routes/paths";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildPageMetadata({
    title: "Playlist",
    description: "Your SeaMusicPlayer playlist.",
    path: PATHS.playlist(id),
    index: false,
  });
}

export default async function PlaylistPage({ params }: PageProps) {
  const { id } = await params;
  return <PlaylistPageFeature playlistId={id} />;
}
