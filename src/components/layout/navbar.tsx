import Link from "next/link";
import { MdHome, MdOutlineWaves } from "react-icons/md";

import { NavbarAuth } from "@/components/layout/navbar-auth";
import { NavbarSearch } from "@/components/layout/navbar-search";
import navMessages from "@/messages/en/nav.json";
import { PATHS } from "@/routes/paths";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 z-100 flex h-15 w-full items-center justify-between gap-4 border-b-2 border-border bg-black px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
        <Link
          href={PATHS.home}
          prefetch
          aria-label={navMessages.logoAriaLabel}
          className="flex shrink-0 items-center gap-2 text-primary"
        >
          <MdOutlineWaves size={36} />
          <span className="hidden text-lg font-bold text-white sm:inline">
            {navMessages.brand}
          </span>
        </Link>

        <Link
          href={PATHS.home}
          prefetch
          aria-label={navMessages.homeAriaLabel}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-background text-3xl text-primary-text"
        >
          <MdHome />
        </Link>

        <div className="h-11 w-full min-w-40 max-w-90 flex-1">
          <NavbarSearch />
        </div>
      </div>

      <div className="shrink-0">
        <NavbarAuth />
      </div>
    </nav>
  );
}
