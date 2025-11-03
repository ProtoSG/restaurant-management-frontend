import type { Order, OrderResponse } from "../models/Order.model";
import type { OrderItem } from "../models/OrderItem.model";
import { orderItemAdapter } from "./OrderItemAdapter";

export function orderAdapter(order: OrderResponse): Order {

  const items: OrderItem[] = order.items ? order.items.map(orderItemAdapter) : [];
  
  return {
    id: order.id,
    status: order.status,
    orderCode: order.orderCode,
    type: order.type,
    total: order.total,
    items: items
  }
}
