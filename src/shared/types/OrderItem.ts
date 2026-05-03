import type { OrderProduct, OrderProductResponse } from "./OrderProduct";

export interface OrderItem {
  id: number;
  quantity: number;
  subTotal: number;
  product: OrderProduct;
  notes?: string;
  isTakeaway?: boolean;
  takeawaySurcharge?: number;
}

export interface OrderItemResponse {
  orderId: number;
  quantity: number;
  subTotal: number;
  product: OrderProductResponse;
  notes?: string;
  isTakeaway?: boolean;
  takeawaySurcharge?: number;
}
