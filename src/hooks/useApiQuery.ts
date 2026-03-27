import { useQuery } from "@tanstack/react-query";

export function useApiQuery<T>(key: string[], fetcher: () => Promise<T[]>) {
  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
