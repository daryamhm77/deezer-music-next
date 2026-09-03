"use client";

import { ShareButton } from "@/components/shared/share-actions";
import { SongListRow } from "@/features/library/components/song-list-row";
import { usePlaylistQuery } from "@/features/library/apis";
import libraryMessages from "@/messages/en/library.json";
import shareMessages from "@/messages/en/share.json";
import { usePlayer } from "@/providers/player-provider";
import { PATHS } from "@/routes/paths";
import { buildPlaylistSharePayload } from "@/utils/share";

type PlaylistDetailFeatureProps = {
  playlistId: string;
};

export function PlaylistDetailFeature({
  playlistId,
}: PlaylistDetailFeatureProps) {
  const { data: playlist, isLoading, isError, error } =
    usePlaylistQuery(playlistId);
  const { playSong } = usePlayer();

  if (isLoading) {
    return <p className="text-secondary-text">Loading...</p>;
  }

  if (isError || !playlist) {
    return (
      <p className="text-secondary-text">
        {error instanceof Error ? error.message : "Playlist not found"}
      </p>
    );
  }

  const playlistUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${PATHS.playlist(playlistId)}`
      : PATHS.playlist(playlistId);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">{playlist.name}</h1>
          <p className="text-secondary-text">{playlist.songs.length} songs</p>
          <p className="mt-1 text-xs text-secondary-text">
            {shareMessages.previewOnly}
          </p>
        </div>
        <ShareButton
          {...buildPlaylistSharePayload({
            name: playlist.name,
            url: playlistUrl,
            songCount: playlist.songs.length,
          })}
          label={shareMessages.sharePlaylist}
        />
      </div>

      {playlist.songs.length === 0 ? (
        <p className="text-secondary-text">{libraryMessages.emptyPlaylist}</p>
      ) : (
        <div className="space-y-1">
          {playlist.songs.map((song, index) => (
            <SongListRow
              key={`${song.id}-${index}`}
              song={song}
              onPlay={() => playSong(playlist.songs, index)}
              removeMode="playlist"
              playlistId={playlistId}
              showFavorite
              showAddToPlaylist
            />
          ))}
        </div>
      )}
    </div>
  );
}
