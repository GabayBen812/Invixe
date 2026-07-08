import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  sessionEmail: "@invixe/sessionEmail",
  lessonsRegistry: "@invixe/lessonsRegistry",
  lessonsRegistryAt: "@invixe/lessonsRegistryAt",
  profileAvatar: "@invixe/profileAvatar",
} as const;

export function profileAvatarKey(email: string | null | undefined): string {
  const safe = (email || "guest").trim().toLowerCase() || "guest";
  return `${STORAGE_KEYS.profileAvatar}:${safe}`;
}

const REGISTRY_TTL_MS = 1000 * 60 * 60 * 24; // 24h

export async function getJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore persistence errors
  }
}

export async function getCachedRegistry<T>(): Promise<T | null> {
  const cachedAt = await AsyncStorage.getItem(STORAGE_KEYS.lessonsRegistryAt);
  if (!cachedAt) return null;
  if (Date.now() - Number(cachedAt) > REGISTRY_TTL_MS) return null;
  return getJson<T>(STORAGE_KEYS.lessonsRegistry);
}

export async function setCachedRegistry<T>(registry: T): Promise<void> {
  await setJson(STORAGE_KEYS.lessonsRegistry, registry);
  await AsyncStorage.setItem(STORAGE_KEYS.lessonsRegistryAt, String(Date.now()));
}
