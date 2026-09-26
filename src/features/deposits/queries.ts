import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";

export function usePaymentMethods() {
  return useQuery({ queryKey: queryKeys.paymentMethods, queryFn: ({ signal }) => walletApi.paymentMethods({ signal }) });
}

export function useCreateDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { payment_method: string; amount_minor: number; details: Record<string, unknown>; idempotencyKey: string }) =>
      walletApi.createDeposit({ payment_method: args.payment_method, amount_minor: args.amount_minor, details: args.details }, args.idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      void queryClient.invalidateQueries({ queryKey: queryKeys.deposits });
    },
  });
}
