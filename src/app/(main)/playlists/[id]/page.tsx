import { PlaylistPageFeature } from "@/features/library/playlist-detail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlaylistPage({ params }: PageProps) {
  const { id } = await params;
  return <PlaylistPageFeature playlistId={id} />;
}
