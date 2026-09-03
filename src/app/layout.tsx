import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { getSiteUrl } from "@/lib/seo";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  themeColor: "#2A3D3E",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SeaMusicPlayer",
    template: "%s · SeaMusicPlayer",
  },
  description: "Discover and play music previews. Powered by Deezer.",
  applicationName: "SeaMusicPlayer",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  openGraph: {
    type: "website",
    siteName: "SeaMusicPlayer",
    locale: "en_US",
    title: "SeaMusicPlayer",
    description: "Discover and play music previews. Powered by Deezer.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "SeaMusicPlayer",
    description: "Discover and play music previews. Powered by Deezer.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
