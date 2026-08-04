import { PlaylistsFeature } from "@/features/library/components/playlists-feature";
import libraryMessages from "@/messages/en/library.json";

export function PlaylistsPageFeature() {
  return (
    <div className="p-4">
      <h1 className="mb-6 text-3xl font-bold text-white">
        {libraryMessages.playlistsTitle}
      </h1>
      <PlaylistsFeature />
    </div>
  );
}
