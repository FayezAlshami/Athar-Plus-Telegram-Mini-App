import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type OrderStatusGroup } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { assertOnline } from "@/lib/network/assert-online";
import { privateQueryOptions } from "@/lib/query/policy";

export function useOrders(status?: OrderStatusGroup) {
  return useInfiniteQuery({
    queryKey: queryKeys.orders(status),
    queryFn: ({ pageParam, signal }) => ordersApi.list({ page: pageParam, status }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
    ...privateQueryOptions,
  });
}

export function useOrder(id: string) {
  return useQuery({ ...privateQueryOptions, queryKey: queryKeys.order(id), queryFn: ({ signal }) => ordersApi.get(id, { signal }) });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      assertOnline();
      return ordersApi.cancel(id);
    },
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.order(order.id), order);
      void queryClient.invalidateQueries({ queryKey: queryKeys.ordersRoot });
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
    },
  });
}
