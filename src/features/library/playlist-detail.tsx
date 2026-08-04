import { PlaylistDetailFeature } from "@/features/library/components/playlist-detail-feature";

type PlaylistPageFeatureProps = {
  playlistId: string;
};

export function PlaylistPageFeature({ playlistId }: PlaylistPageFeatureProps) {
  return (
    <div className="p-4">
      <PlaylistDetailFeature playlistId={playlistId} />
    </div>
  );
}
