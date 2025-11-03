import type { Product, ProductResponse } from "./Product.model";

export interface OrderItem {
  id: number;
  quantity: number;
  subTotal: number;
  product: Product;
}

export interface OrderItemResponse {
  id: number;
  quantity: number;
  subTotal: number;
  product: ProductResponse;
}
