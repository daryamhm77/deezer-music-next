import type { Metadata } from "next";

import { SignInFeature } from "@/features/auth";
import { buildPageMetadata } from "@/lib/seo";
import { PATHS } from "@/routes/paths";

export const metadata: Metadata = buildPageMetadata({
  title: "Log in",
  description: "Log in to SeaMusicPlayer to save favorites and playlists.",
  path: PATHS.login,
});

export default SignInFeature;
