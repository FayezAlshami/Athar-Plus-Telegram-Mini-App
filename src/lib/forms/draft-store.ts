const PREFIX = "athar.draft.";

/** Form drafts live in sessionStorage and die with the tab. Tokens and files are never stored. */
export const draftStore = {
  read<T>(key: string): T | null {
    if (typeof sessionStorage === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  write(key: string, value: unknown): void {
    if (typeof sessionStorage === "undefined") return;
    try {
      sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // A full or blocked store must not block the form.
    }
  },
  clear(key: string): void {
    if (typeof sessionStorage === "undefined") return;
    try {
      sessionStorage.removeItem(PREFIX + key);
    } catch {
      // Ignore.
    }
  },
};
