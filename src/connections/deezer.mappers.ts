import {
  DeezerTrackSchema,
  type Song,
} from "@/contracts/endpoints/deezer";

export function mapTrackToSong(track: unknown): Song | null {
  const parsed = DeezerTrackSchema.safeParse(track);
  if (!parsed.success) return null;

  const data = parsed.data;
  const cover =
    data.album.cover_xl ||
    data.album.cover_big ||
    data.album.cover_medium ||
    "";

  if (!cover) return null;

  const preview = data.preview && data.preview.length > 0 ? data.preview : null;
  const artistImage =
    data.artist.picture_big || data.artist.picture_medium || null;

  return {
    id: String(data.id),
    title: data.title,
    artist: data.artist.name,
    artist_id: String(data.artist.id),
    artist_image_url: artistImage,
    cover_image_url: cover,
    audio_url: preview,
    external_url: data.link,
  };
}
