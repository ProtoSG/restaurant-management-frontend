import defaultApiClient from "@/shared/utils/apiClient";
import { orderAdapter } from "../adapters/OrderAdapter";
import type { IVoiceOrderService } from "../types/IVoiceOrderService";
import type { VoiceOrderPreview, VoiceOrderConfirmRequest } from "../types/VoiceOrder";
import type { Order, OrderResponse } from "@/shared/types/Order";

export class VoiceOrderServiceImpl implements IVoiceOrderService {
  async extractFromText(text: string): Promise<VoiceOrderPreview> {
    const { data } = await defaultApiClient.post<VoiceOrderPreview>("/voice-order-test", { text });
    return data;
  }

  async confirm(request: VoiceOrderConfirmRequest): Promise<Order> {
    const { data } = await defaultApiClient.post<OrderResponse>("/voice-order-test/confirm", request);
    return orderAdapter(data);
  }
}
