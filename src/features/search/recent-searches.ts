import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const MAX_RECENT_SEARCHES = 8;

/** Recent searches stay on the device only. */
export const recentSearches = {
  read(): string[] {
    try {
      const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.recentSearches) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  },
  add(query: string): string[] {
    const next = [query, ...this.read().filter((item) => item !== query)].slice(0, MAX_RECENT_SEARCHES);
    this.write(next);
    return next;
  },
  clear(): void {
    this.write([]);
  },
  write(items: string[]): void {
    try {
      window.localStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(items));
    } catch {
      // Storage can be unavailable in private WebViews; recents are optional.
    }
  },
};
