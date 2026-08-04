"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Song } from "@/contracts";

type PlayerContextValue = {
  currentMusic: Song | null;
  isMusicPlaying: boolean;
  setIsMusicPlaying: (playing: boolean) => void;
  queue: Song[];
  currentIndex: number;
  queueModal: boolean;
  setQueueModal: (open: boolean | ((prev: boolean) => boolean)) => void;
  playSong: (songs: Song[], index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
};

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

type PlayerProviderProps = {
  children: React.ReactNode;
};

export function PlayerProvider({ children }: PlayerProviderProps) {
  const [currentMusic, setCurrentMusic] = useState<Song | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [queueModal, setQueueModal] = useState(false);

  useEffect(() => {
    if (queue.length > 0 && currentIndex >= 0 && currentIndex < queue.length) {
      setCurrentMusic(queue[currentIndex] ?? null);
    }
  }, [currentIndex, queue]);

  const playSong = useCallback((songs: Song[], index: number) => {
    setQueue(songs);
    setCurrentIndex(index);
    setIsMusicPlaying(true);
  }, []);

  const playNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < queue.length - 1) return prev + 1;
      return prev;
    });
  }, [queue.length]);

  const playPrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) return prev - 1;
      return prev;
    });
  }, []);

  const value = useMemo(
    () => ({
      currentMusic,
      isMusicPlaying,
      setIsMusicPlaying,
      queue,
      currentIndex,
      queueModal,
      setQueueModal,
      playSong,
      playNext,
      playPrevious,
    }),
    [
      currentMusic,
      isMusicPlaying,
      queue,
      currentIndex,
      queueModal,
      playSong,
      playNext,
      playPrevious,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }

  return context;
}
