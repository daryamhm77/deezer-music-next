"use client";

import Image from "next/image";

import type { Song } from "@/contracts";
import playerMessages from "@/messages/en/player.json";
import { usePlayer } from "@/providers/player-provider";

export function Queue() {
  const {
    queue,
    currentMusic,
    queueModal,
    currentIndex,
    playSong,
  } = usePlayer();

  if (!queueModal) return null;

  return (
    <div className="fixed top-15 right-5 z-50 h-[75vh] w-full max-w-[300px] overflow-y-auto rounded-md border border-hover bg-black p-4 scrollbar-hide">
      <h2 className="font-bold text-white">{playerMessages.queue}</h2>

      <div className="mt-8">
        <h3 className="mb-3 font-bold text-white">{playerMessages.nowPlaying}</h3>
        {currentMusic ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg p-2 hover:bg-hover">
            <Image
              src={currentMusic.cover_image_url}
              alt={playerMessages.coverAlt}
              width={300}
              height={300}
              className="h-10 w-10 rounded-md object-cover"
            />
            <div>
              <p className="font-semibold text-primary">{currentMusic.title}</p>
              <p className="text-sm text-secondary-text">
                {playerMessages.byArtist.replace("{artist}", currentMusic.artist)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <h3 className="mb-3 font-bold text-white">{playerMessages.queueList}</h3>
        {queue.map((item: Song, index) => (
          <button
            type="button"
            key={`${item.id}-${index}`}
            onClick={() => playSong(queue, index)}
            className="mb-4 flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-left hover:bg-hover"
          >
            <Image
              src={item.cover_image_url}
              alt={playerMessages.coverAlt}
              width={300}
              height={300}
              className="h-10 w-10 rounded-md object-cover"
            />
            <div>
              <p
                className={`font-semibold ${
                  currentIndex === index ? "text-primary" : "text-primary-text"
                }`}
              >
                {item.title}
              </p>
              <p className="text-sm text-secondary-text">
                {playerMessages.byArtist.replace("{artist}", item.artist)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
