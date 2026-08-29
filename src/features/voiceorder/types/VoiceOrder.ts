export type VoiceOrderItemStatus = 'RESOLVED' | 'PRICE_MISMATCH' | 'NOT_FOUND' | 'NOT_AVAILABLE';
export type VoiceOrderTableStatus = 'RESOLVED' | 'MISSING' | 'NOT_FOUND' | 'NOT_APPLICABLE';

export interface VoiceOrderPreviewItem {
  status: VoiceOrderItemStatus;
  rawText: string;
  productId: number | null;
  productName: string | null;
  selectedPrice: number | null;
  quantity: number;
  notes: string | null;
  /** Este ítem puntual es para llevar, independiente de isTakeawayOrder (todo el pedido). */
  isTakeaway: boolean;
}

export interface VoiceOrderPreview {
  tableNumber: number | null;
  tableId: number | null;
  tableStatus: VoiceOrderTableStatus;
  /** Todo el pedido es para llevar, sin mesa — distinto de isTakeaway a nivel de ítem. */
  isTakeawayOrder: boolean;
  items: VoiceOrderPreviewItem[];
  allResolved: boolean;
}

export interface VoiceOrderConfirmItem {
  productId: number;
  selectedPrice: number;
  quantity: number;
  notes: string | null;
  isTakeaway: boolean;
}

export interface VoiceOrderConfirmRequest {
  /** null cuando isTakeawayOrder es true — un pedido para llevar no tiene mesa. */
  tableNumber: number | null;
  isTakeawayOrder: boolean;
  items: VoiceOrderConfirmItem[];
}
