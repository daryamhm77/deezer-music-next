import { FavoriteArtistsFeature } from "@/features/library/components/favorite-artists-feature";
import libraryMessages from "@/messages/en/library.json";

export function FavoriteArtistsPageFeature() {
  return (
    <div className="p-4">
      <h1 className="mb-6 text-3xl font-bold text-white">
        {libraryMessages.favoriteArtistsTitle}
      </h1>
      <FavoriteArtistsFeature />
    </div>
  );
}
