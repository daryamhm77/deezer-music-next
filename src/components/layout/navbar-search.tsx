"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";

import navMessages from "@/messages/en/nav.json";
import { PATHS } from "@/routes/paths";

export function NavbarSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (pathname === PATHS.search) {
      const query = new URLSearchParams(window.location.search).get("q") ?? "";
      setValue(query);
      return;
    }
    setValue("");
  }, [pathname]);

  useEffect(() => {
    const trimmed = value.trim();
    const timer = window.setTimeout(() => {
      if (!trimmed) {
        if (pathname === PATHS.search) {
          router.replace(PATHS.search);
        }
        return;
      }

      const next = `${PATHS.search}?q=${encodeURIComponent(trimmed)}`;
      const currentQuery =
        pathname === PATHS.search
          ? new URLSearchParams(window.location.search).get("q")?.trim() ?? ""
          : "";
      const current = currentQuery
        ? `${PATHS.search}?q=${encodeURIComponent(currentQuery)}`
        : "";

      if (next !== current) {
        router.push(next);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [value, pathname, router]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      router.push(PATHS.search);
      return;
    }
    router.push(`${PATHS.search}?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-11 w-full items-center gap-3 rounded-full bg-background px-3 text-primary-text"
      role="search"
    >
      <IoSearch className="shrink-0 text-primary-text" size={25} />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={navMessages.searchPlaceholder}
        className="h-full w-full bg-transparent outline-none placeholder:text-secondary-text"
        aria-label={navMessages.searchPlaceholder}
        autoComplete="off"
      />
    </form>
  );
}
