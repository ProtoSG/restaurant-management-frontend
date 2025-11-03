import type { OrderStatus } from "../enums/OrderStatus";
import type { OrderType } from "../enums/OrderType";
import type { OrderItem, OrderItemResponse } from "./OrderItem.model";

export interface Order {
  id: number;
  orderCode: string;
  status: OrderStatus;
  type: OrderType;
  total: number;
  items: OrderItem[];
}

export interface OrderResponse {
  id: number;
  orderCode: string;
  status: OrderStatus;
  type: OrderType;
  total: number;
  items: OrderItemResponse[];
}
