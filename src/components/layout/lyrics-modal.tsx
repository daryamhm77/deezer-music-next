"use client";

import { useQuery } from "@tanstack/react-query";
import { IoClose } from "react-icons/io5";

import playerMessages from "@/messages/en/player.json";

type LyricsModalProps = {
  open: boolean;
  title: string;
  artist: string;
  onClose: () => void;
};

type LyricsPayload = {
  lyrics: string | null;
  instrumental: boolean;
  found: boolean;
};

async function fetchLyrics(title: string, artist: string) {
  const params = new URLSearchParams({ title, artist });
  const response = await fetch(`/api/lyrics?${params.toString()}`);
  const payload = await response.json();

  if (payload.status !== 200) {
    throw new Error(payload.message || "Failed to load lyrics");
  }

  return payload.data as LyricsPayload;
}

export function LyricsModal({ open, title, artist, onClose }: LyricsModalProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["lyrics", title, artist],
    queryFn: () => fetchLyrics(title, artist),
    enabled: open && Boolean(title) && Boolean(artist),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={playerMessages.lyrics}
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg border border-border bg-background"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-white">{playerMessages.lyrics}</h2>
            <p className="text-sm text-secondary-text">
              {title} · {artist}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-secondary-text hover:bg-hover hover:text-white"
            aria-label={playerMessages.closeLyrics}
          >
            <IoClose size={22} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 text-sm leading-7 text-primary-text whitespace-pre-wrap">
          {isLoading ? (
            <p className="text-secondary-text">{playerMessages.lyricsLoading}</p>
          ) : null}
          {isError ? (
            <p className="text-danger">
              {error instanceof Error
                ? error.message
                : playerMessages.lyricsError}
            </p>
          ) : null}
          {!isLoading && !isError && data?.instrumental ? (
            <p className="text-secondary-text">{playerMessages.instrumental}</p>
          ) : null}
          {!isLoading && !isError && data && !data.found && !data.instrumental ? (
            <p className="text-secondary-text">{playerMessages.lyricsNotFound}</p>
          ) : null}
          {!isLoading && !isError && data?.lyrics ? data.lyrics : null}
        </div>
      </div>
    </div>
  );
}
