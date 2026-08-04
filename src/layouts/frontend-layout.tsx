"use client";

import { MusicPlayer, Navbar, Queue, Sidebar } from "@/components/layout";
import { usePlayer } from "@/providers/player-provider";

type FrontendLayoutProps = {
  children: React.ReactNode;
};

export function FrontendLayout({ children }: FrontendLayoutProps) {
  const { isMusicPlaying } = usePlayer();

  return (
    <div className="min-h-screen">
      <Navbar />
      <Sidebar />
      {isMusicPlaying ? <MusicPlayer /> : null}
      <Queue />
      <main className={`pt-15 lg:pl-[19.5rem] ${isMusicPlaying ? "pb-28" : ""}`}>
        {children}
      </main>
    </div>
  );
}
