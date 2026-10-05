import { useQuery } from "@tanstack/react-query";
import { faqsApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";

export function useFaqs() {
  return useQuery({ queryKey: queryKeys.faqs, queryFn: ({ signal }) => faqsApi.list({ signal }) });
}
