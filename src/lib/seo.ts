import type { Metadata } from "next";

function originFromHost(value?: string | null) {
  if (!value) return undefined;
  const trimmed = value.replace(/\/$/, "");
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Canonical public origin. Preview deploys use the unique Vercel URL. */
export function getSiteUrl() {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return (
    originFromHost(process.env.BETTER_AUTH_URL) ||
    originFromHost(process.env.NEXT_PUBLIC_APP_URL) ||
    originFromHost(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    originFromHost(process.env.VERCEL_URL) ||
    "http://localhost:3000"
  );
}

/** Auth CSRF / callback origins (production + current Vercel deployment). */
export function getTrustedOrigins() {
  const origins = new Set<string>();

  for (const value of [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]) {
    const origin = originFromHost(value);
    if (origin) origins.add(origin);
  }

  origins.add(getSiteUrl());
  return [...origins];
}

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
  index?: boolean;
};

/** Shared title / description / canonical / Open Graph / Twitter cards. */
export function buildPageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  index = true,
}: BuildPageMetadataInput): Metadata {
  const site = getSiteUrl();
  const url = path.startsWith("http") ? path : `${site}${path}`;
  const ogImage = image
    ? [
        {
          url: image,
          width: 1000,
          height: 1000,
          alt: imageAlt || title,
        },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "SeaMusicPlayer",
      locale: "en_US",
      type: "website",
      images: ogImage,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}
