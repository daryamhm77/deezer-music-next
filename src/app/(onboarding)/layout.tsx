import { QueryProvider } from "@/providers/query-provider";

export default function OnboardingGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <QueryProvider>{children}</QueryProvider>;
}
