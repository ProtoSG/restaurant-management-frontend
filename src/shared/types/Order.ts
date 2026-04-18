import type { OrderStatus } from "../enums/OrderStatus";
import type { OrderType } from "../enums/OrderType";
import type { OrderItem } from "./OrderItem";
import type { Transaction } from "./Transaction";

export interface Order {
  id: number;
  orderCode: string;
  tableId?: number;
  tableNumber?: string;
  status: OrderStatus;
  type: OrderType;
  customerName?: string;
  total: number;
  items: OrderItem[];
  paidAmount?: number;
  remainingAmount?: number;
  transactions?: Transaction[];
}

export interface OrderResponse {
  id: number;
  orderCode: string;
  tableId?: number;
  tableNumber?: string;
  status: OrderStatus;
  type: OrderType;
  customerName?: string;
  total: number;
  items: OrderItem[];
  paidAmount?: number;
  remainingAmount?: number;
  transactions?: Transaction[];
}
