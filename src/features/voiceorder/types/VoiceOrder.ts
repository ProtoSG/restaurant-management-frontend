export type VoiceOrderItemStatus = 'RESOLVED' | 'PRICE_MISMATCH' | 'NOT_FOUND' | 'NOT_AVAILABLE';
export type VoiceOrderTableStatus = 'RESOLVED' | 'MISSING' | 'NOT_FOUND';

export interface VoiceOrderPreviewItem {
  status: VoiceOrderItemStatus;
  rawText: string;
  productId: number | null;
  productName: string | null;
  selectedPrice: number | null;
  quantity: number;
  notes: string | null;
}

export interface VoiceOrderPreview {
  tableNumber: number | null;
  tableId: number | null;
  tableStatus: VoiceOrderTableStatus;
  items: VoiceOrderPreviewItem[];
  allResolved: boolean;
}

export interface VoiceOrderConfirmItem {
  productId: number;
  selectedPrice: number;
  quantity: number;
  notes: string | null;
}

export interface VoiceOrderConfirmRequest {
  tableNumber: number;
  items: VoiceOrderConfirmItem[];
}
