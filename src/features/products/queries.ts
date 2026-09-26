import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateOrderInput } from "@/entities/order/types";
import { catalogApi, ordersApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";

export function useProduct(idOrSlug: string) {
  return useQuery({ queryKey: queryKeys.product(idOrSlug), queryFn: ({ signal }) => catalogApi.product(idOrSlug, { signal }) });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, idempotencyKey }: { input: CreateOrderInput; idempotencyKey: string }) => ordersApi.create(input, idempotencyKey),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.order(order.id), order);
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ordersRoot });
    },
  });
}
