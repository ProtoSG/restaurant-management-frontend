import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import defaultApiClient from "@/shared/utils/apiClient";

export function useQuickAddProducts(): number[] {
  const { data } = useQuery({
    queryKey: ["quick-add-products"],
    queryFn: async () => {
      const { data } = await defaultApiClient.get<number[]>("/config/quick-add-products");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
  return data ?? [];
}

export function useUpdateQuickAddProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const { data } = await defaultApiClient.put<number[]>("/config/quick-add-products", ids);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-add-products"] });
    },
  });
}
