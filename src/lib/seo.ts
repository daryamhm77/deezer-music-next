import type { Metadata } from "next";

export function getSiteUrl() {
  return (
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
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
