import { orderAdapter } from "../adapters/OrderAdapter";
import defaultApiClient from "@/shared/utils/apiClient";
import { THERMAL_PRINTER_URL } from "@/shared/Config";
import type { Order, OrderResponse } from "@/shared/types/Order";
import type { CreateOrderRequest } from "../schemas/Order.schema";

export class OrderServiceImpl {
  async getActiveOrders(): Promise<Order[]> {
    const { data } = await defaultApiClient.get<OrderResponse[]>("/orders/active");
    return data.map(orderAdapter);
  }

  async getAllOrders(): Promise<Order[]> {
    const { data } = await defaultApiClient.get<OrderResponse[]>("/orders");
    return data.map(orderAdapter);
  }

  async getOrderById(id: number): Promise<Order> {
    const { data } = await defaultApiClient.get<OrderResponse>(`/orders/${id}`);
    return orderAdapter(data);
  }

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const payload = {
      tableId: data.tableId ? parseInt(data.tableId) : null,
      type: data.type,
      customerName: data.customerName || null
    };
    const { data: response } = await defaultApiClient.post<OrderResponse>("/orders", payload);
    return orderAdapter(response);
  }

  async addItemToOrder(orderId: number, productId: number, quantity = 1, notes?: string, isTakeaway?: boolean): Promise<void> {
    await defaultApiClient.post(`/orders/${orderId}/items`, {
      productId,
      quantity,
      notes,
      isTakeaway: isTakeaway ?? false,
    });
  }

  async updateOrderItem(orderId: number, itemId: number, quantity: number, isTakeaway?: boolean): Promise<void> {
    await defaultApiClient.put(`/orders/${orderId}/items/${itemId}`, {
      quantity,
      isTakeaway,
    });
  }

  async removeOrderItem(orderId: number, itemId: number): Promise<void> {
    await defaultApiClient.delete(`/orders/${orderId}/items/${itemId}`);
  }

  async cancelOrder(id: number): Promise<Order> {
    const { data } = await defaultApiClient.post<OrderResponse>(`/orders/${id}/cancel`);
    return orderAdapter(data);
  }

  async markAsReady(orderId: number): Promise<Order> {
    const { data } = await defaultApiClient.post<OrderResponse>(`/orders/${orderId}/ready`);
    return orderAdapter(data);
  }

  async payOrder(orderId: number, paymentMethod: string): Promise<Order> {
    const { data } = await defaultApiClient.post<OrderResponse>(`/orders/${orderId}/pay/${paymentMethod}`);
    return orderAdapter(data);
  }

  async payPartialOrder(orderId: number, amount: number, paymentMethod: string): Promise<Order> {
    const { data } = await defaultApiClient.post<OrderResponse>(`/orders/${orderId}/pay-partial`, {
      amount,
      paymentMethod
    });
    return orderAdapter(data);
  }

  async printThermal(order: import("@/shared/types/Order").Order): Promise<void> {
    const res = await fetch(THERMAL_PRINTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Error al imprimir");
    }
  }
}