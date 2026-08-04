export const PATHS = {
  home: "/",
  login: "/login",
  signup: "/signup",
  onboarding: "/onboarding",
  search: "/search",
  playlists: "/playlists",
  playlist: (id: string) => `/playlists/${id}`,
  favoriteSongs: "/favorites/songs",
  favoriteArtists: "/favorites/artists",
} as const;
