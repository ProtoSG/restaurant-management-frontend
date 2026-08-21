import type { OrderProduct, OrderProductResponse } from "./OrderProduct";

export interface OrderItem {
  id: number;
  quantity: number;
  /** Precio realmente cobrado en esta línea (base o de variante) — no usar product.price para mostrarlo. */
  unitPrice: number;
  subTotal: number;
  product: OrderProduct;
  notes?: string;
  isTakeaway?: boolean;
  takeawaySurcharge?: number;
  /** Cuánto de `quantity` ya fue enviado/impreso a cocina. `quantity > kitchenPrintedQuantity` significa que queda pendiente de enviar. */
  kitchenPrintedQuantity?: number;
}

export interface OrderItemResponse {
  id: number;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  product: OrderProductResponse;
  notes?: string;
  isTakeaway?: boolean;
  takeawaySurcharge?: number;
  kitchenPrintedQuantity?: number;
}
