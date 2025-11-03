import type { OrderItem, OrderItemResponse } from "../models/OrderItem.model";
import { ProductAdapter } from "./ProductAdapter";

export function orderItemAdapter(orderItem: OrderItemResponse): OrderItem {
  return {
    id: orderItem.id,
    quantity: orderItem.quantity,
    subTotal: orderItem.subTotal,
    product: ProductAdapter(orderItem.product)
  }
}
