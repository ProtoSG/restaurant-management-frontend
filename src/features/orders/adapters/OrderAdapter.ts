import type { Order, OrderResponse } from "@/shared/types/Order";
import type { OrderItem } from "@/shared/types/OrderItem";
import { orderItemAdapter } from "./OrderItemAdapter";

export function orderAdapter(order: OrderResponse): Order {
  const items: OrderItem[] = order.items ? order.items.map(orderItemAdapter) : [];
  
  return {
    id: order.id,
    status: order.status,
    orderCode: order.orderCode,
    type: order.type,
    customerName: order.customerName,
    tableId: order.tableId,
    tableNumber: order.tableNumber,
    total: order.total,
    items: items,
    paidAmount: order.paidAmount,
    remainingAmount: order.remainingAmount,
    transactions: order.transactions
  };
}