/** Catalog can stay warm; private money and account data stays short-lived and in memory only. */
export const CATALOG_STALE_MS = 5 * 60_000;
export const PRIVATE_STALE_MS = 30_000;

export const catalogQueryOptions = {
  staleTime: CATALOG_STALE_MS,
  refetchOnWindowFocus: false,
  networkMode: "offlineFirst" as const,
};

export const privateQueryOptions = {
  staleTime: PRIVATE_STALE_MS,
  refetchOnWindowFocus: true,
  networkMode: "offlineFirst" as const,
};
