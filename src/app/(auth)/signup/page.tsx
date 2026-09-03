import type { Metadata } from "next";

import { SignUpFeature } from "@/features/auth";
import { buildPageMetadata } from "@/lib/seo";
import { PATHS } from "@/routes/paths";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign up",
  description: "Create a SeaMusicPlayer account to follow artists and build playlists.",
  path: PATHS.signup,
});

export default SignUpFeature;
