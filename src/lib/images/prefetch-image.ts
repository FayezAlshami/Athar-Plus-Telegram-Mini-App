const warmed = new Set<string>();

/** Warms the browser (and service worker) image cache before navigation. */
export function prefetchImage(url: string | null | undefined): void {
  if (!url || typeof window === "undefined" || warmed.has(url)) return;
  warmed.add(url);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
}
