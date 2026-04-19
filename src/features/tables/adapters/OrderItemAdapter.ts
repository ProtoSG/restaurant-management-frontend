import type { OrderItem, OrderItemResponse } from "@/shared/types/OrderItem";

export function orderItemAdapter(orderItem: OrderItemResponse): OrderItem {
  return {
    id: orderItem.id,
    quantity: orderItem.quantity,
    subTotal: orderItem.subTotal,
    product: orderItem.product,
    notes: orderItem.notes
  }
}
