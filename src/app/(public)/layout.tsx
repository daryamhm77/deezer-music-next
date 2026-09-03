import { FrontendLayout } from "@/layouts/frontend-layout";
import { PlayerProvider } from "@/providers/player-provider";
import { QueryProvider } from "@/providers/query-provider";

/**
 * Public app chrome: Server pages for home/search, client islands for
 * navbar / sidebar / player only. No onboarding gate (keeps guest HTML crawlable).
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <PlayerProvider>
        <FrontendLayout>{children}</FrontendLayout>
      </PlayerProvider>
    </QueryProvider>
  );
}
