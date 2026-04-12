import { orderAdapter } from "../adapters/OrderAdapter";
import defaultApiClient from "@/shared/utils/apiClient";
import type { Order } from "@/shared/types/Order";
import type { CreateOrderRequest } from "../schemas/Order.schema";

export class OrderServiceImpl {
  async getActiveOrders(): Promise<Order[]> {
    const { data } = await defaultApiClient.get<Order[]>("/orders/active");
    return data.map(orderAdapter);
  }

  async getAllOrders(): Promise<Order[]> {
    const { data } = await defaultApiClient.get<Order[]>("/orders");
    return data.map(orderAdapter);
  }

  async getOrderById(id: number): Promise<Order> {
    const { data } = await defaultApiClient.get<Order>(`/orders/${id}`);
    return orderAdapter(data);
  }

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const payload = {
      tableId: data.tableId ? parseInt(data.tableId) : null,
      type: data.type,
      customerName: data.customerName || null
    };
    const { data: response } = await defaultApiClient.post<Order>("/orders", payload);
    return orderAdapter(response);
  }

  async addItemToOrder(orderId: number, productId: number, quantity = 1): Promise<void> {
    await defaultApiClient.post(`/orders/${orderId}/items`, {
      productId,
      quantity
    });
  }

  async updateOrderItem(orderId: number, itemId: number, quantity: number): Promise<void> {
    await defaultApiClient.put(`/orders/${orderId}/items/${itemId}`, {
      quantity
    });
  }

  async removeOrderItem(orderId: number, itemId: number): Promise<void> {
    await defaultApiClient.delete(`/orders/${orderId}/items/${itemId}`);
  }

  async cancelOrder(id: number): Promise<Order> {
    const { data } = await defaultApiClient.post<Order>(`/orders/${id}/cancel`);
    return orderAdapter(data);
  }

  async changeOrderType(id: number, type: string): Promise<Order> {
    const { data } = await defaultApiClient.put<Order>(`/orders/${id}/type`, { type });
    return orderAdapter(data);
  }

  async payOrder(orderId: number, paymentMethod: string): Promise<Order> {
    const { data } = await defaultApiClient.post<Order>(`/orders/${orderId}/pay/${paymentMethod}`);
    return orderAdapter(data);
  }

  async payPartialOrder(orderId: number, amount: number, paymentMethod: string): Promise<Order> {
    const { data } = await defaultApiClient.post<Order>(`/orders/${orderId}/pay-partial`, {
      amount,
      paymentMethod
    });
    return orderAdapter(data);
  }

  async printThermal(orderId: number): Promise<void> {
    await defaultApiClient.post(`/orders/${orderId}/print-thermal`);
  }
}