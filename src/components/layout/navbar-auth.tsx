"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { signOut, useSession } from "@/lib/auth-client";
import authMessages from "@/messages/en/auth.json";
import navMessages from "@/messages/en/nav.json";
import { PATHS } from "@/routes/paths";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "U";
  return source.slice(0, 1).toUpperCase();
}

export function NavbarAuth() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  if (isPending) {
    return <div className="h-11 w-11 animate-pulse rounded-full bg-hover" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-6">
        <Link
          href={PATHS.signup}
          className="font-bold text-secondary-text hover:scale-105 hover:text-white"
        >
          {authMessages.signUp}
        </Link>
        <Link
          href={PATHS.login}
          className="grid h-11 place-items-center rounded-full bg-white px-8 font-bold text-gray-950 hover:scale-105"
        >
          {authMessages.logIn}
        </Link>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label={navMessages.menu}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="grid h-11 w-11 cursor-pointer place-items-center overflow-hidden rounded-full bg-primary text-sm font-bold text-black hover:scale-105"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || user.email || "User"}
            width={44}
            height={44}
            className="h-11 w-11 object-cover"
          />
        ) : (
          getInitials(user.name, user.email)
        )}
      </button>

      {open ? (
        <div className="absolute top-13 right-0 z-50 min-w-52 overflow-hidden rounded-md border border-border bg-black py-2 shadow-lg">
          <div className="border-b border-border px-4 py-2">
            <p className="truncate text-sm font-semibold text-primary-text">
              {user.name || user.email}
            </p>
            {user.name && user.email ? (
              <p className="truncate text-xs text-secondary-text">{user.email}</p>
            ) : null}
          </div>
          <Link
            href={PATHS.favoriteSongs}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-primary-text hover:bg-hover"
          >
            {navMessages.favoriteSongs}
          </Link>
          <Link
            href={PATHS.favoriteArtists}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-primary-text hover:bg-hover"
          >
            {navMessages.favoriteArtists}
          </Link>
          <Link
            href={PATHS.playlists}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-primary-text hover:bg-hover"
          >
            {navMessages.playlists}
          </Link>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
              router.push(PATHS.home);
              router.refresh();
            }}
            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-primary-text hover:bg-hover"
          >
            {navMessages.logOut}
          </button>
        </div>
      ) : null}
    </div>
  );
}
