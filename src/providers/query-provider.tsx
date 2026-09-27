"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { isApiError } from "@/lib/api/errors";
import { assertOnline } from "@/lib/network/assert-online";
import { PRIVATE_STALE_MS } from "@/lib/query/policy";

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
          queries: {
            staleTime: PRIVATE_STALE_MS,
            retry: shouldRetry,
            refetchOnWindowFocus: true,
            networkMode: "offlineFirst",
          },
          // always: a write fails at once while offline instead of pausing and replaying later.
          mutations: { retry: false, networkMode: "always" },
        },
        mutationCache: new MutationCache({
          onMutate: () => {
            assertOnline();
          },
        }),
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
