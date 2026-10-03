/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, ExpirationPlugin, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const PRIVATE_API_PREFIXES = [
  "/api/v1/wallet",
  "/api/v1/orders",
  "/api/v1/profile",
  "/api/v1/notifications",
  "/api/v1/deposits",
  "/api/v1/membership",
  "/api/v1/favorites",
  "/api/v1/auth",
  "/api/v1/admin",
];

const catalogMatcher = ({ url, request }: { url: URL; request: Request }) => {
  if (request.method !== "GET") return false;
  if (PRIVATE_API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return false;
  return /^\/api\/v1\/(home|categories|products|search|banners|campaigns)/.test(url.pathname);
};

const PAYMENT_ICONS = ["/payments/binance.jpg", "/payments/mtn.jpg", "/payments/sham-cash.jpg", "/payments/syriatel.png"].map(
  (url) => ({ url, revision: "1" }),
);

const serwist = new Serwist({
  precacheEntries: [...(self.__SW_MANIFEST ?? []), ...PAYMENT_ICONS],
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request }) => request.destination === "image",
      handler: new CacheFirst({
        cacheName: "athar-images",
        plugins: [new ExpirationPlugin({ maxEntries: 160, maxAgeSeconds: 60 * 60 * 24 * 14 })],
      }),
    },
    {
      matcher: catalogMatcher,
      handler: new StaleWhileRevalidate({
        cacheName: "athar-catalog",
        plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 300 })],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
