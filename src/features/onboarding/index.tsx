"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineWaves } from "react-icons/md";

import {
  useArtistSuggestionsQuery,
  useCompleteOnboardingMutation,
} from "@/features/onboarding/apis";
import type { Artist } from "@/contracts";
import onboardingMessages from "@/messages/en/onboarding.json";
import { PATHS } from "@/routes/paths";

const MIN_ARTISTS = 10;

export function OnboardingFeature() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Artist[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data: artists, isLoading } = useArtistSuggestionsQuery(debouncedSearch);
  const completeOnboarding = useCompleteOnboardingMutation();

  const selectedIds = useMemo(
    () => new Set(selected.map((artist) => artist.id)),
    [selected],
  );

  const canContinue = selected.length >= MIN_ARTISTS;

  const toggleArtist = (artist: Artist) => {
    setSelected((prev) => {
      if (prev.some((item) => item.id === artist.id)) {
        return prev.filter((item) => item.id !== artist.id);
      }
      if (prev.length >= 50) return prev;
      return [...prev, artist];
    });
  };

  const handleContinue = async () => {
    if (!canContinue || completeOnboarding.isPending) return;
    await completeOnboarding.mutateAsync(selected);
    router.replace(PATHS.home);
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <MdOutlineWaves className="mb-3 text-primary" size={48} />
        <h1 className="text-3xl font-bold text-white">{onboardingMessages.title}</h1>
        <p className="mt-2 max-w-xl text-secondary-text">
          {onboardingMessages.subtitle}
        </p>
        <p className="mt-4 font-semibold text-primary">
          {onboardingMessages.progress.replace(
            "{count}",
            String(selected.length),
          )}
        </p>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={onboardingMessages.searchPlaceholder}
        className="mb-6 w-full rounded-full border border-border bg-background px-5 py-3 text-primary-text outline-none placeholder:text-secondary-text"
      />

      {selected.length > 0 ? (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold tracking-wide text-secondary-text uppercase">
            {onboardingMessages.selected}
          </h2>
          <div className="flex flex-wrap gap-2">
            {selected.map((artist) => (
              <button
                key={artist.id}
                type="button"
                onClick={() => toggleArtist(artist)}
                className="cursor-pointer rounded-full bg-primary/20 px-3 py-1 text-sm text-primary hover:bg-primary/30"
              >
                {artist.name} ×
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <h2 className="mb-3 text-sm font-bold tracking-wide text-secondary-text uppercase">
        {search.trim()
          ? onboardingMessages.searchPlaceholder
          : onboardingMessages.suggested}
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-md bg-hover"
            />
          ))}
        </div>
      ) : artists && artists.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {artists.map((artist) => {
            const isSelected = selectedIds.has(artist.id);
            return (
              <button
                key={artist.id}
                type="button"
                onClick={() => toggleArtist(artist)}
                className={`cursor-pointer rounded-md p-3 text-center transition ${
                  isSelected
                    ? "bg-primary/20 ring-2 ring-primary"
                    : "bg-background hover:bg-hover"
                }`}
              >
                {artist.image_url ? (
                  <Image
                    src={artist.image_url}
                    alt={artist.name}
                    width={160}
                    height={160}
                    className="mx-auto h-28 w-28 rounded-full object-cover"
                  />
                ) : (
                  <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-hover text-2xl font-bold text-primary">
                    {artist.name.slice(0, 1)}
                  </div>
                )}
                <p className="mt-3 truncate font-semibold text-primary-text">
                  {artist.name}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-secondary-text">{onboardingMessages.emptySearch}</p>
      )}

      <div className="sticky bottom-4 mt-8 flex flex-col items-center gap-2">
        {!canContinue ? (
          <p className="text-sm text-secondary-text">
            {onboardingMessages.minRequired}
          </p>
        ) : null}
        <button
          type="button"
          disabled={!canContinue || completeOnboarding.isPending}
          onClick={handleContinue}
          className="w-full max-w-md cursor-pointer rounded-full bg-primary py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {completeOnboarding.isPending
            ? onboardingMessages.creating
            : onboardingMessages.continue}
        </button>
        {completeOnboarding.isError ? (
          <p className="text-sm text-danger">
            {completeOnboarding.error instanceof Error
              ? completeOnboarding.error.message
              : "Something went wrong"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
