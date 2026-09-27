import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { assertOnline } from "@/lib/network/assert-online";
import { privateQueryOptions } from "@/lib/query/policy";

/** Balance is always fetched from the server; the client never computes it. */
export function useWallet() {
  return useQuery({ ...privateQueryOptions, queryKey: queryKeys.wallet, queryFn: ({ signal }) => walletApi.wallet({ signal }) });
}

export function useWalletTransactions() {
  return useInfiniteQuery({
    queryKey: queryKeys.walletTransactions,
    queryFn: ({ pageParam, signal }) => walletApi.transactions(pageParam, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
    ...privateQueryOptions,
  });
}

export function useRedeemGiftCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => {
      assertOnline();
      return walletApi.redeemGiftCode(code);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wallet }),
  });
}
