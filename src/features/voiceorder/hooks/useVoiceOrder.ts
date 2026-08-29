import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { VoiceOrderServiceImpl } from "../services/VoiceOrderServiceImpl";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import type { VoiceOrderConfirmRequest } from "../types/VoiceOrder";

const voiceOrderService = new VoiceOrderServiceImpl();

export function useExtractVoiceOrder() {
  return useMutation({
    mutationFn: (text: string) => voiceOrderService.extractFromText(text),
    onError: (error) => {
      console.error('Error al extraer el pedido dictado:', error);
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useConfirmVoiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: VoiceOrderConfirmRequest) => voiceOrderService.confirm(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('Error al confirmar el pedido por voz:', error);
      toast.error(getApiErrorMessage(error));
    },
  });
}
