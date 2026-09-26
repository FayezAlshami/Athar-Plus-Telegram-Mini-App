"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { isApiError } from "@/lib/api/errors";

const STALE_TIME_MS = 30_000;
const MAX_RETRIES = 2;

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
  return failureCount < MAX_RETRIES;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: STALE_TIME_MS, retry: shouldRetry, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
        mutationCache: new MutationCache(),
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
