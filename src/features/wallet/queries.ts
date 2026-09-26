import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";

/** Balance is always fetched from the server; the client never computes it. */
export function useWallet() {
  return useQuery({ queryKey: queryKeys.wallet, queryFn: ({ signal }) => walletApi.wallet({ signal }), staleTime: 0 });
}

export function useWalletTransactions() {
  return useInfiniteQuery({
    queryKey: queryKeys.walletTransactions,
    queryFn: ({ pageParam, signal }) => walletApi.transactions(pageParam, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
  });
}

export function useRedeemGiftCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => walletApi.redeemGiftCode(code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wallet }),
  });
}
