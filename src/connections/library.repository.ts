import { ObjectId, type WithId } from "mongodb";

import type { Artist, Playlist, Song } from "@/contracts";
import { getMongoDb } from "@/lib/mongodb";

type PlaylistDoc = {
  userId: string;
  name: string;
  description?: string;
  songs: Song[];
  createdAt: Date;
  updatedAt: Date;
};

type FavoriteSongDoc = {
  userId: string;
  song: Song;
  createdAt: Date;
};

type FavoriteArtistDoc = {
  userId: string;
  artist: Artist;
  createdAt: Date;
};

function mapPlaylist(doc: WithId<PlaylistDoc>): Playlist {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    songs: doc.songs,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listPlaylists(userId: string) {
  const db = getMongoDb();
  const docs = await db
    .collection<PlaylistDoc>("playlists")
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();

  return docs.map(mapPlaylist);
}

export async function getPlaylist(userId: string, playlistId: string) {
  if (!ObjectId.isValid(playlistId)) return null;

  const db = getMongoDb();
  const doc = await db.collection<PlaylistDoc>("playlists").findOne({
    _id: new ObjectId(playlistId),
    userId,
  });

  return doc ? mapPlaylist(doc) : null;
}

export async function createPlaylist(
  userId: string,
  name: string,
  description?: string,
  songs: Song[] = [],
) {
  const db = getMongoDb();
  const now = new Date();
  const doc: PlaylistDoc = {
    userId,
    name,
    description,
    songs,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<PlaylistDoc>("playlists").insertOne(doc);

  return mapPlaylist({ ...doc, _id: result.insertedId });
}

export async function deletePlaylist(userId: string, playlistId: string) {
  if (!ObjectId.isValid(playlistId)) return false;

  const db = getMongoDb();
  const result = await db.collection<PlaylistDoc>("playlists").deleteOne({
    _id: new ObjectId(playlistId),
    userId,
  });

  return result.deletedCount === 1;
}

export async function addSongToPlaylist(
  userId: string,
  playlistId: string,
  song: Song,
) {
  if (!ObjectId.isValid(playlistId)) return null;

  const db = getMongoDb();
  const existing = await db.collection<PlaylistDoc>("playlists").findOne({
    _id: new ObjectId(playlistId),
    userId,
  });

  if (!existing) return null;

  if (existing.songs.some((item) => item.id === song.id)) {
    return mapPlaylist(existing);
  }

  const updatedAt = new Date();
  await db.collection<PlaylistDoc>("playlists").updateOne(
    { _id: existing._id },
    {
      $push: { songs: song },
      $set: { updatedAt },
    },
  );

  return getPlaylist(userId, playlistId);
}

export async function removeSongFromPlaylist(
  userId: string,
  playlistId: string,
  songId: string,
) {
  if (!ObjectId.isValid(playlistId)) return null;

  const db = getMongoDb();
  await db.collection<PlaylistDoc>("playlists").updateOne(
    { _id: new ObjectId(playlistId), userId },
    {
      $pull: { songs: { id: songId } },
      $set: { updatedAt: new Date() },
    },
  );

  return getPlaylist(userId, playlistId);
}

export async function listFavoriteSongs(userId: string) {
  const db = getMongoDb();
  const docs = await db
    .collection<FavoriteSongDoc>("favorite_songs")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((doc) => doc.song);
}

export async function addFavoriteSong(userId: string, song: Song) {
  const db = getMongoDb();
  await db.collection<FavoriteSongDoc>("favorite_songs").updateOne(
    { userId, "song.id": song.id },
    {
      $set: { userId, song, createdAt: new Date() },
    },
    { upsert: true },
  );

  return song;
}

export async function removeFavoriteSong(userId: string, songId: string) {
  const db = getMongoDb();
  const result = await db.collection<FavoriteSongDoc>("favorite_songs").deleteOne({
    userId,
    "song.id": songId,
  });

  return result.deletedCount === 1;
}

export async function listFavoriteArtists(userId: string) {
  const db = getMongoDb();
  const docs = await db
    .collection<FavoriteArtistDoc>("favorite_artists")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((doc) => doc.artist);
}

export async function addFavoriteArtist(userId: string, artist: Artist) {
  const db = getMongoDb();
  await db.collection<FavoriteArtistDoc>("favorite_artists").updateOne(
    { userId, "artist.id": artist.id },
    {
      $set: { userId, artist, createdAt: new Date() },
    },
    { upsert: true },
  );

  return artist;
}

export async function removeFavoriteArtist(userId: string, artistId: string) {
  const db = getMongoDb();
  const result = await db
    .collection<FavoriteArtistDoc>("favorite_artists")
    .deleteOne({
      userId,
      "artist.id": artistId,
    });

  return result.deletedCount === 1;
}
