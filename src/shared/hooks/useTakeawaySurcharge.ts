import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import defaultApiClient from "@/shared/utils/apiClient";

export function useTakeawaySurcharge(): number {
  const { data } = useQuery({
    queryKey: ["takeaway-surcharge"],
    queryFn: async () => {
      const { data } = await defaultApiClient.get<number>("/config/takeaway-surcharge");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
  return data ?? 1;
}

export function useUpdateTakeawaySurcharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const { data } = await defaultApiClient.put<number>("/config/takeaway-surcharge", amount);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["takeaway-surcharge"] });
    },
  });
}
