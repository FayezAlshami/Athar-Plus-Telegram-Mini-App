function hostOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const TRUSTED_HOSTS = new Set(
  [hostOf(process.env.NEXT_PUBLIC_API_URL), hostOf(process.env.NEXT_PUBLIC_APP_URL)].filter((host): host is string => host !== null),
);

/**
 * True when next/image may proxy this source. Mirrors `images.remotePatterns`:
 * only our own origins go through the optimizer; anything else loads directly.
 */
export function canOptimizeImage(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  const host = hostOf(src);
  return host !== null && TRUSTED_HOSTS.has(host);
}
