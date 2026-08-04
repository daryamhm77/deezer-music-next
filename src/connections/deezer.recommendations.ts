import { deezerFetch } from "@/connections/deezer.connection";
import {
  getArtistTopSongs,
  mapDeezerArtist,
  shuffleSongs,
  uniqueSongs,
} from "@/connections/deezer.artists";
import { mapTrackToSong } from "@/connections/deezer.mappers";
import {
  listFavoriteArtists,
  listPlaylists,
} from "@/connections/library.repository";
import { getUserPreferences } from "@/connections/user-preferences.repository";
import type { Artist, Genre, Playlist, Song } from "@/contracts";

type ListResponse = {
  data?: unknown[];
};

type AlbumListItem = {
  id?: number | string;
  genre_id?: number | string | null;
};

type GenreResponse = {
  id?: number | string;
  name?: string;
  picture_medium?: string | null;
  picture_big?: string | null;
  picture_xl?: string | null;
};

export type HomeRecommendations = {
  following: Artist[];
  recommendedArtists: Artist[];
  recommendedSongs: Song[];
  topGenres: Array<Genre & { songs: Song[] }>;
  playlists: Playlist[];
};

function uniqueArtists(artists: Artist[]) {
  const seen = new Set<string>();
  return artists.filter((artist) => {
    if (seen.has(artist.id)) return false;
    seen.add(artist.id);
    return true;
  });
}

async function getRelatedArtists(artistId: string, limit = 8) {
  const result = await deezerFetch<ListResponse>(
    `/artist/${artistId}/related?limit=${limit}`,
  );

  return (result.data ?? [])
    .map(mapDeezerArtist)
    .filter((artist): artist is Artist => Boolean(artist));
}

async function getArtistGenreIds(artistId: string) {
  try {
    const result = await deezerFetch<{ data?: AlbumListItem[] }>(
      `/artist/${artistId}/albums?limit=5`,
    );

    return (result.data ?? [])
      .map((album) =>
        album.genre_id != null ? String(album.genre_id) : null,
      )
      .filter((id): id is string => Boolean(id) && id !== "0");
  } catch {
    return [] as string[];
  }
}

async function getGenreById(genreId: string): Promise<Genre | null> {
  try {
    const result = await deezerFetch<GenreResponse>(`/genre/${genreId}`);
    if (!result.id || !result.name || String(result.id) === "0") return null;

    return {
      id: String(result.id),
      name: result.name,
      image_url:
        result.picture_xl || result.picture_big || result.picture_medium || null,
    };
  } catch {
    return null;
  }
}

async function getGenreChartSongs(genreId: string, limit = 8) {
  try {
    const result = await deezerFetch<ListResponse>(
      `/chart/${genreId}/tracks?limit=${limit}`,
    );

    return (result.data ?? [])
      .map(mapTrackToSong)
      .filter((song): song is Song => Boolean(song));
  } catch {
    return [] as Song[];
  }
}

async function getChartFallback() {
  const [tracks, artists, genres] = await Promise.all([
    deezerFetch<ListResponse>("/chart/0/tracks?limit=24"),
    deezerFetch<ListResponse>("/chart/0/artists?limit=15"),
    deezerFetch<ListResponse>("/genre"),
  ]);

  const recommendedSongs = (tracks.data ?? [])
    .map(mapTrackToSong)
    .filter((song): song is Song => Boolean(song));

  const recommendedArtists = (artists.data ?? [])
    .map(mapDeezerArtist)
    .filter((artist): artist is Artist => Boolean(artist));

  const topGenres = await Promise.all(
    (genres.data ?? [])
      .slice(0, 8)
      .map(async (item) => {
        const genre = await getGenreById(
          String((item as GenreResponse).id ?? ""),
        );
        if (!genre) return null;
        const songs = await getGenreChartSongs(genre.id, 8);
        return { ...genre, songs };
      }),
  );

  return {
    following: [] as Artist[],
    recommendedArtists,
    recommendedSongs,
    topGenres: topGenres.filter(
      (genre): genre is Genre & { songs: Song[] } => Boolean(genre),
    ),
    playlists: [] as Playlist[],
  } satisfies HomeRecommendations;
}

export async function buildHomeRecommendations(
  userId: string,
): Promise<HomeRecommendations> {
  const [favorites, preferences, playlists] = await Promise.all([
    listFavoriteArtists(userId),
    getUserPreferences(userId),
    listPlaylists(userId),
  ]);

  const seedMap = new Map<string, Artist>();
  for (const artist of [...favorites, ...preferences.selectedArtists]) {
    seedMap.set(artist.id, artist);
  }
  const seedArtists = [...seedMap.values()];

  if (seedArtists.length === 0) {
    const fallback = await getChartFallback();
    return {
      ...fallback,
      playlists: playlists.filter((playlist) => playlist.songs.length > 0),
    };
  }

  const sample = seedArtists.slice(0, 10);
  const relatedSample = sample.slice(0, 6);

  const [relatedGroups, songGroups, genreIdGroups] = await Promise.all([
    Promise.all(
      relatedSample.map(async (artist) => {
        try {
          return await getRelatedArtists(artist.id, 8);
        } catch {
          return [] as Artist[];
        }
      }),
    ),
    Promise.all(
      sample.map(async (artist) => {
        try {
          return await getArtistTopSongs(artist.id, 6);
        } catch {
          return [] as Song[];
        }
      }),
    ),
    Promise.all(sample.slice(0, 8).map((artist) => getArtistGenreIds(artist.id))),
  ]);

  const followedIds = new Set(seedArtists.map((artist) => artist.id));
  const recommendedArtists = uniqueArtists(relatedGroups.flat())
    .filter((artist) => !followedIds.has(artist.id))
    .slice(0, 16);

  const recommendedSongs = shuffleSongs(uniqueSongs(songGroups.flat())).slice(
    0,
    30,
  );

  const genreCounts = new Map<string, number>();
  for (const genreId of genreIdGroups.flat()) {
    genreCounts.set(genreId, (genreCounts.get(genreId) ?? 0) + 1);
  }

  const rankedGenreIds = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, 8);

  const topGenres = (
    await Promise.all(
      rankedGenreIds.map(async (genreId) => {
        const genre = await getGenreById(genreId);
        if (!genre) return null;
        const songs = await getGenreChartSongs(genre.id, 8);
        return { ...genre, songs };
      }),
    )
  ).filter((genre): genre is Genre & { songs: Song[] } => Boolean(genre));

  return {
    following: seedArtists.slice(0, 12),
    recommendedArtists:
      recommendedArtists.length > 0
        ? recommendedArtists
        : seedArtists.slice(0, 12),
    recommendedSongs,
    topGenres,
    playlists: playlists.filter((playlist) => playlist.songs.length > 0),
  };
}
