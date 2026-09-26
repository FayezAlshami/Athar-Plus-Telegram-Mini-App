import { useQuery } from "@tanstack/react-query";
import { accountApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";

export function useMembership() {
  return useQuery({ queryKey: queryKeys.membership, queryFn: ({ signal }) => accountApi.membership({ signal }) });
}

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: ({ signal }) => accountApi.profile({ signal }) });
}
