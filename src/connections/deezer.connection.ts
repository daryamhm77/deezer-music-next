export async function deezerFetch<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.deezer.com${path}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Deezer API ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}
