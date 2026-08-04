import { z } from "zod";

export const DeezerArtistSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  picture_medium: z.string().url().optional().nullable(),
  picture_big: z.string().url().optional().nullable(),
});

export const DeezerAlbumSchema = z.object({
  cover_medium: z.string().url().optional().nullable(),
  cover_big: z.string().url().optional().nullable(),
  cover_xl: z.string().url().optional().nullable(),
});

export const DeezerTrackSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string(),
  preview: z.string().url().nullable().or(z.literal("")),
  link: z.string().url(),
  artist: DeezerArtistSchema,
  album: DeezerAlbumSchema,
});

export const SongSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  artist_id: z.string(),
  artist_image_url: z.string().nullable(),
  cover_image_url: z.string(),
  audio_url: z.string().nullable(),
  external_url: z.string(),
});

export const ArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  image_url: z.string().nullable(),
});

export const GenreSchema = z.object({
  id: z.string(),
  name: z.string(),
  image_url: z.string().nullable(),
});

export const PlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  songs: z.array(SongSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreatePlaylistSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(200).optional(),
});

export const ApiOkSchema = <T extends z.ZodType>(data: T) =>
  z.object({
    status: z.literal(200),
    data,
  });

export const ApiErrorSchema = z.object({
  status: z.union([z.literal(401), z.literal(404), z.literal(500)]),
  message: z.string(),
});

export const SongsListResponseSchema = z.discriminatedUnion("status", [
  ApiOkSchema(z.array(SongSchema)),
  ApiErrorSchema,
]);

export type Song = z.infer<typeof SongSchema>;
export type Artist = z.infer<typeof ArtistSchema>;
export type Genre = z.infer<typeof GenreSchema>;
export type Playlist = z.infer<typeof PlaylistSchema>;
export type SongsListResponse = z.infer<typeof SongsListResponseSchema>;
