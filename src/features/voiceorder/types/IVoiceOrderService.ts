import type { Order } from "@/shared/types/Order";
import type { VoiceOrderPreview, VoiceOrderConfirmRequest } from "./VoiceOrder";

export interface IVoiceOrderService {
  /** Único método de extracción de esta pasada: texto dictado por el mesero vía teclado nativo. */
  extractFromText(text: string): Promise<VoiceOrderPreview>;
  confirm(request: VoiceOrderConfirmRequest): Promise<Order>;
  // Futuro: extractFromAudio(audio: Blob): Promise<VoiceOrderPreview> — cuando el backend
  // exponga transcripción real (ver GET /voice-order-test/capabilities). La interfaz ya
  // queda lista para sumarlo sin tocar los consumidores del servicio.
}
