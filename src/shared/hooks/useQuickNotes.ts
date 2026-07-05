import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import defaultApiClient from "@/shared/utils/apiClient";

export function useQuickNotes(): string[] {
  const { data } = useQuery({
    queryKey: ["quick-notes"],
    queryFn: async () => {
      const { data } = await defaultApiClient.get<string[]>("/config/quick-notes");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
  return data ?? [];
}

export function useUpdateQuickNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notes: string[]) => {
      const { data } = await defaultApiClient.put<string[]>("/config/quick-notes", notes);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-notes"] });
    },
  });
}
