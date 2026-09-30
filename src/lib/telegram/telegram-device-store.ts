import type { TelegramDeviceStorage } from "./web-app";

const memory = new Map<string, string>();

export async function deviceGet(storage: TelegramDeviceStorage | undefined, key: string): Promise<string | null> {
  if (typeof storage?.getItem === "function") {
    return new Promise((resolve) => {
      storage.getItem(key, (_error, value) => resolve(typeof value === "string" ? value : null));
    });
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

export async function deviceSet(storage: TelegramDeviceStorage | undefined, key: string, value: string): Promise<void> {
  if (typeof storage?.setItem === "function") {
    await new Promise<void>((resolve) => {
      storage.setItem(key, value, () => resolve());
    });
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memory.set(key, value);
  }
}
