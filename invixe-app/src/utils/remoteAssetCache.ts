import { fetchWithTimeout } from "./fetchWithTimeout";

const memoryCache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

/** Shared in-memory cache for remote SVG/text assets used across drills. */
export async function fetchRemoteText(url: string): Promise<string> {
  const cached = memoryCache.get(url);
  if (cached !== undefined) return cached;

  const pending = inflight.get(url);
  if (pending) return pending;

  const promise = (async () => {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`Failed to fetch asset: ${res.status}`);
    const text = await res.text();
    memoryCache.set(url, text);
    inflight.delete(url);
    return text;
  })().catch((err) => {
    inflight.delete(url);
    throw err;
  });

  inflight.set(url, promise);
  return promise;
}

export function peekRemoteText(url: string): string | undefined {
  return memoryCache.get(url);
}
