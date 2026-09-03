/**
 * Auth screens are static shells (SSG). Forms hydrate on the client.
 * Intentionally light — no player, query provider, or library chrome.
 */
export const dynamic = "force-static";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
