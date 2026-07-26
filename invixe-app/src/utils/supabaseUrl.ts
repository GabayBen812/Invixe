const OLD_SUPABASE_HOST = "https://msmkiolnyhtnvjabfinh.supabase.co";
const NEW_SUPABASE_HOST = "https://mkdwubjposlywjiinwkn.supabase.co";

/** Trim and validate a remote asset URL (no host rewriting). */
export function normalizeSupabaseUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("blob:") || lower.startsWith("data:")) return null;
  return trimmed;
}

/** Browser-only URLs from the lesson builder — unusable in React Native. */
export function isBrowserOnlyUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const lower = url.trim().toLowerCase();
  return lower.startsWith("blob:") || lower.startsWith("data:");
}

/** Pick the first loadable remote URL from lesson-builder fields. */
export function resolveLessonRemoteUrl(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    const normalized = normalizeSupabaseUrl(candidate);
    if (normalized && isRemoteAssetUrl(normalized)) {
      return normalized;
    }
  }
  return null;
}

export function isSupabaseStorageUrl(url: string): boolean {
  return (
    url.includes(OLD_SUPABASE_HOST) || url.includes(NEW_SUPABASE_HOST)
  );
}

/** Swap between legacy and current Supabase project hosts. */
export function getAlternateSupabaseUrl(url: string): string | null {
  if (url.startsWith(OLD_SUPABASE_HOST)) {
    return NEW_SUPABASE_HOST + url.slice(OLD_SUPABASE_HOST.length);
  }
  if (url.startsWith(NEW_SUPABASE_HOST)) {
    return OLD_SUPABASE_HOST + url.slice(NEW_SUPABASE_HOST.length);
  }
  return null;
}

export function isRemoteAssetUrl(url: string): boolean {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//")
  );
}

const resolvedUrlCache = new Map<string, string>();

/** Pick a host that actually serves the asset (lesson images span both projects). */
export async function resolveSupabaseAssetUrl(
  url: string,
): Promise<string> {
  const normalized = normalizeSupabaseUrl(url);
  if (!normalized || !isRemoteAssetUrl(normalized)) {
    return normalized || url;
  }

  const cached = resolvedUrlCache.get(normalized);
  if (cached) return cached;

  if (!isSupabaseStorageUrl(normalized)) {
    resolvedUrlCache.set(normalized, normalized);
    return normalized;
  }

  const candidates = [normalized];
  const alternate = getAlternateSupabaseUrl(normalized);
  if (alternate) candidates.push(alternate);

  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, { method: "HEAD" });
      if (res.ok) {
        resolvedUrlCache.set(normalized, candidate);
        return candidate;
      }
    } catch {
      // try next host
    }
  }

  resolvedUrlCache.set(normalized, normalized);
  return normalized;
}
