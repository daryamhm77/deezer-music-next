export async function deezerFetch<T>(
  path: string,
  options?: { revalidate?: number | false },
): Promise<T> {
  const revalidate = options?.revalidate;

  const response = await fetch(`https://api.deezer.com${path}`, {
    ...(revalidate === false
      ? { cache: "no-store" as const }
      : { next: { revalidate: revalidate ?? 60 } }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Deezer API ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}
