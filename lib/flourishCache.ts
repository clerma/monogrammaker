// Versioned localStorage cache for generated flourish fragments.
// Keyed by `${frameId}:${slotId}` — swapping frames keeps prior work.

const STORAGE_KEY = "monogrammaker:flourishes:v1";

export type CacheMap = Record<string, string>;

export function loadCache(): CacheMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as CacheMap;
    return {};
  } catch {
    return {};
  }
}

export function saveCache(cache: CacheMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Quota exceeded or storage disabled — ignore silently.
  }
}

export function cacheKey(frameId: string, slotId: string): string {
  return `${frameId}:${slotId}`;
}
