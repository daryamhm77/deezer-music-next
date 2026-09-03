"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
  IoMdPause,
  IoMdPlay,
  IoMdSkipBackward,
  IoMdSkipForward,
  IoMdVolumeHigh,
  IoMdVolumeOff,
} from "react-icons/io";
import { LuRepeat, LuRepeat1 } from "react-icons/lu";
import { MdOutlineQueueMusic, MdPlaylistAdd } from "react-icons/md";
import { HiOutlineMicrophone } from "react-icons/hi2";

import { LyricsModal } from "@/components/layout/lyrics-modal";
import {
  OpenInDeezerButton,
  ShareButton,
} from "@/components/shared/share-actions";
import {
  useAddSongToPlaylistMutation,
  useFavoriteSongsQuery,
  usePlaylistsQuery,
  useToggleFavoriteSongMutation,
} from "@/features/library/apis";
import { useSession } from "@/lib/auth-client";
import libraryMessages from "@/messages/en/library.json";
import playerMessages from "@/messages/en/player.json";
import shareMessages from "@/messages/en/share.json";
import { usePlayer } from "@/providers/player-provider";
import { PATHS } from "@/routes/paths";
import { buildSongSharePayload } from "@/utils/share";
import Link from "next/link";

function formatTime(time: number) {
  if (!Number.isFinite(time) || time < 0) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [previousVolume, setPreviousVolume] = useState(75);
  const [repeatSong, setRepeatSong] = useState(true);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false);

  const {
    currentMusic,
    playNext,
    playPrevious,
    queueModal,
    setQueueModal,
  } = usePlayer();

  const { data: session } = useSession();
  const { data: favoriteSongs } = useFavoriteSongsQuery(Boolean(session));
  const { data: playlists } = usePlaylistsQuery(Boolean(session));
  const toggleFavoriteSong = useToggleFavoriteSongMutation();
  const addSongToPlaylist = useAddSongToPlaylistMutation();

  const isFavorite = useMemo(() => {
    if (!currentMusic || !favoriteSongs) return false;
    return favoriteSongs.some((song) => song.id === currentMusic.id);
  }, [currentMusic, favoriteSongs]);

  const canPlay = Boolean(currentMusic?.audio_url);

  const togglePlayButton = async () => {
    if (!audioRef.current || !currentMusic?.audio_url) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number.parseInt(event.target.value, 10);
    setVolume(nextVolume);
    if (audioRef.current) {
      audioRef.current.volume = nextVolume / 100;
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number.parseFloat(event.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(previousVolume);
      if (audioRef.current) {
        audioRef.current.volume = previousVolume / 100;
      }
      return;
    }

    setPreviousVolume(volume);
    setVolume(0);
    if (audioRef.current) {
      audioRef.current.volume = 0;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateTime);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateTime);
    };
  }, [currentMusic]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatSong) {
        audio.currentTime = 0;
        void audio.play();
        return;
      }

      playNext();
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [repeatSong, playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentMusic) return;

    setCurrentTime(0);
    setDuration(0);
    setLyricsOpen(false);
    setPlaylistMenuOpen(false);

    if (!currentMusic.audio_url) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    const playAudio = async () => {
      try {
        audio.load();
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    void playAudio();
  }, [currentMusic]);

  if (!currentMusic) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 z-50 w-full bg-black px-4 py-3 text-white shadow-md">
        <audio
          ref={audioRef}
          src={currentMusic.audio_url ?? undefined}
          preload="metadata"
        />

        <div className="mx-auto flex w-[95%] max-w-7xl flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
          <div className="flex min-w-0 items-center gap-4">
            <Image
              src={currentMusic.cover_image_url}
              width={500}
              height={500}
              alt={playerMessages.coverAlt}
              className="h-13 w-13 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0 text-sm">
              <p className="truncate text-white">{currentMusic.title}</p>
              <p className="truncate font-normal text-secondary-text">
                {currentMusic.artist}
              </p>
              <p className="truncate text-xs font-normal text-secondary-text">
                {canPlay
                  ? shareMessages.previewOnly
                  : playerMessages.noPreview}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {session ? (
                <>
                  <button
                    type="button"
                    className="grid h-8 w-8 cursor-pointer place-items-center text-secondary-text hover:text-white"
                    aria-label={
                      isFavorite
                        ? libraryMessages.unfavoriteSong
                        : libraryMessages.favoriteSong
                    }
                    onClick={() =>
                      toggleFavoriteSong.mutate({
                        song: currentMusic,
                        isFavorite,
                      })
                    }
                  >
                    {isFavorite ? (
                      <FaHeart size={18} className="text-primary" />
                    ) : (
                      <FaRegHeart size={18} />
                    )}
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      className="grid h-8 w-8 cursor-pointer place-items-center text-secondary-text hover:text-white"
                      aria-label={libraryMessages.addToPlaylist}
                      onClick={() => setPlaylistMenuOpen((prev) => !prev)}
                    >
                      <MdPlaylistAdd size={20} />
                    </button>
                    {playlistMenuOpen ? (
                      <div className="absolute bottom-8 left-0 z-50 min-w-44 rounded-md border border-border bg-black py-1 shadow-lg">
                        {!playlists || playlists.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-secondary-text">
                            <p>{libraryMessages.emptyPlaylist}</p>
                            <Link
                              href={PATHS.playlists}
                              className="mt-1 inline-block text-primary underline"
                              onClick={() => setPlaylistMenuOpen(false)}
                            >
                              {libraryMessages.createPlaylist}
                            </Link>
                          </div>
                        ) : (
                          playlists.map((playlist) => (
                            <button
                              key={playlist.id}
                              type="button"
                              className="block w-full cursor-pointer px-3 py-2 text-left text-xs text-primary-text hover:bg-hover"
                              onClick={() => {
                                addSongToPlaylist.mutate({
                                  playlistId: playlist.id,
                                  song: currentMusic,
                                });
                                setPlaylistMenuOpen(false);
                              }}
                            >
                              {playlist.name}
                            </button>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}

              <OpenInDeezerButton url={currentMusic.external_url} compact />
              <ShareButton
                compact
                {...buildSongSharePayload(currentMusic)}
                label={shareMessages.shareSong}
              />

              <button
                type="button"
                className="grid h-8 w-8 cursor-pointer place-items-center text-secondary-text hover:text-white"
                aria-label={playerMessages.lyrics}
                onClick={() => setLyricsOpen(true)}
              >
                <HiOutlineMicrophone size={18} />
              </button>
            </div>
          </div>

          <div className="flex w-full max-w-[400px] flex-col items-center gap-3">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={playPrevious}
                className="cursor-pointer text-xl text-secondary-text"
                aria-label={playerMessages.previous}
              >
                <IoMdSkipBackward />
              </button>
              <button
                type="button"
                onClick={togglePlayButton}
                disabled={!canPlay}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white text-xl text-black disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={isPlaying ? playerMessages.pause : playerMessages.play}
              >
                {isPlaying ? <IoMdPause /> : <IoMdPlay />}
              </button>
              <button
                type="button"
                onClick={playNext}
                className="cursor-pointer text-xl text-secondary-text"
                aria-label={playerMessages.next}
              >
                <IoMdSkipForward />
              </button>
            </div>

            <div className="flex w-full items-center justify-center gap-2">
              <span className="text-sm font-normal text-secondary-text">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                disabled={!canPlay}
                className="h-1 w-full appearance-none rounded bg-hover accent-primary outline-none"
              />
              <span className="text-sm font-normal text-secondary-text">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {repeatSong ? (
              <button
                type="button"
                onClick={() => setRepeatSong(false)}
                className="cursor-pointer text-primary"
                aria-label={playerMessages.repeatOne}
              >
                <LuRepeat1 />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRepeatSong(true)}
                className="cursor-pointer"
                aria-label={playerMessages.repeat}
              >
                <LuRepeat />
              </button>
            )}

            <button
              type="button"
              onClick={() => setQueueModal(!queueModal)}
              className="cursor-pointer text-xl text-secondary-text"
              aria-label={playerMessages.queue}
            >
              <MdOutlineQueueMusic />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="cursor-pointer text-xl text-secondary-text"
              aria-label={volume === 0 ? playerMessages.unmute : playerMessages.mute}
            >
              {volume === 0 ? <IoMdVolumeOff /> : <IoMdVolumeHigh />}
            </button>

            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={handleVolumeChange}
              className="h-1 w-[100px] appearance-none rounded bg-hover accent-primary outline-none"
            />
          </div>
        </div>
      </div>

      <LyricsModal
        open={lyricsOpen}
        title={currentMusic.title}
        artist={currentMusic.artist}
        onClose={() => setLyricsOpen(false)}
      />
    </>
  );
}
