import { FavoriteSongsFeature } from "@/features/library/components/favorite-songs-feature";
import libraryMessages from "@/messages/en/library.json";

export function FavoriteSongsPageFeature() {
  return (
    <div className="p-4">
      <h1 className="mb-6 text-3xl font-bold text-white">
        {libraryMessages.favoriteSongsTitle}
      </h1>
      <FavoriteSongsFeature />
    </div>
  );
}
