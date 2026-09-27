/**
 * What the mini-app service worker may store.
 * Catalog GETs are cached even when they carry a bearer token, because every
 * customer call is authenticated and the catalog is what should open offline.
 * Anything private, any write, and the whole admin surface is network-only.
 * The cache key is the URL, never the Authorization header.
 */
const CATALOG_PATTERNS = [
  /^\/api\/v1\/home$/,
  /^\/api\/v1\/categories(?:\/[^/]+)?$/,
  /^\/api\/v1\/products(?:\/[^/]+)?$/,
  /^\/api\/v1\/campaigns\/[^/]+$/,
  /^\/api\/v1\/search$/,
  /^\/api\/v1\/banners(?:\/[^/]+)?$/,
];

export type CacheDecision = "catalog" | "image" | "static" | "none";

export function cacheDecision(input: {
  method: string;
  pathname: string;
  hasAuthorization: boolean;
  destination?: string;
}): CacheDecision {
  if (input.method.toUpperCase() !== "GET") return "none";
  if (input.pathname === "/admin" || input.pathname.startsWith("/admin/") || input.pathname.startsWith("/api/v1/admin")) {
    return "none";
  }
  if (CATALOG_PATTERNS.some((pattern) => pattern.test(input.pathname))) return "catalog";
  if (input.hasAuthorization) return "none";
  if (input.destination === "image" || /\.(?:png|jpe?g|webp|gif|avif|svg)$/i.test(input.pathname)) return "image";
  if (input.pathname.startsWith("/_next/static/")) return "static";
  return "none";
}
