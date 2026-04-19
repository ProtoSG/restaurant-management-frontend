import type { OrderProduct, OrderProductResponse } from "./OrderProduct";

export interface OrderItem {
  id: number;
  quantity: number;
  subTotal: number;
  product: OrderProduct;
  notes?: string;
}

export interface OrderItemResponse {
  id: number;
  quantity: number;
  subTotal: number;
  product: OrderProductResponse;
  notes?: string;
}
