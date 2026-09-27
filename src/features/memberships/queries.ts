import { useQuery } from "@tanstack/react-query";
import { accountApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { privateQueryOptions } from "@/lib/query/policy";

export function useMembership() {
  return useQuery({ ...privateQueryOptions, queryKey: queryKeys.membership, queryFn: ({ signal }) => accountApi.membership({ signal }) });
}

export function useProfile() {
  return useQuery({ ...privateQueryOptions, queryKey: queryKeys.profile, queryFn: ({ signal }) => accountApi.profile({ signal }) });
}
