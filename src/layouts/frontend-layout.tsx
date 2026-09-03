"use client";

import { MusicPlayer, Navbar, Queue, Sidebar } from "@/components/layout";
import { usePlayer } from "@/providers/player-provider";

type FrontendLayoutProps = {
  children: React.ReactNode;
};

/**
 * Client island chrome shared by public + private layouts.
 * Pages above this can stay Server Components; player/nav/sidebar hydrate here.
 */
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
