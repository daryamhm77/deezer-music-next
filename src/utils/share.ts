type SharePayload = {
  title: string;
  text?: string;
  url: string;
};

export async function shareOrCopy(payload: SharePayload): Promise<"shared" | "copied"> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
      return "shared";
    } catch (error) {
      // User cancelled share sheet — don't fall through as an error toast spam.
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }
    }
  }

  await navigator.clipboard.writeText(
    payload.text ? `${payload.text}\n${payload.url}` : payload.url,
  );
  return "copied";
}

export function buildSongSharePayload(song: {
  title: string;
  artist: string;
  external_url: string;
}): SharePayload {
  return {
    title: `${song.title} · ${song.artist}`,
    text: `Listen to ${song.title} by ${song.artist} on Deezer`,
    url: song.external_url,
  };
}

export function buildPlaylistSharePayload(input: {
  name: string;
  url: string;
  songCount: number;
}): SharePayload {
  return {
    title: input.name,
    text: `${input.name} · ${input.songCount} songs on SeaMusicPlayer`,
    url: input.url,
  };
}
