import axios from "axios";
import { orderAdapter } from "../adapters/OrderAdapter";
import { tableAdapater } from "../adapters/TableAdapter";
import defaultApiClient from "@/shared/utils/apiClient";
import type { ITableService } from "../types/ITableService";
import type { Order, OrderResponse } from "@/shared/types/Order";
import type { OrderItem } from "@/shared/types/OrderItem";
import type { Table, TableResponse } from "../types/Table";
import type { CreateTableRequest, UpdateTableRequest } from "../schemas/Table.schema";

export class TableServiceImpl implements ITableService {
  async getTables(): Promise<Table[]> {
    const { data } = await defaultApiClient.get<TableResponse[]>("/tables");
    const tables = data.map(tableAdapater);
    return tables;
  }

  async update(id: number, table: UpdateTableRequest): Promise<Table> {
    const { data } = await defaultApiClient.put<TableResponse>(`/tables/${id}`, table);
    return tableAdapater(data);
  }

  async create(table: CreateTableRequest): Promise<Table> {
    const { data } = await defaultApiClient.post<TableResponse>("/tables", table);
    return tableAdapater(data);
  }

  async delete(id: number): Promise<void> {
    await defaultApiClient.delete<void>(`/tables/${id}`);
  }

  async createOrder(tableId: number): Promise<Order> {
    const { data } = await defaultApiClient.post<OrderResponse>('/orders', { tableId, type: 'DINE_IN' });
    return orderAdapter(data);
  }

  async getOrderActive(id: number): Promise<Order | null> {
    try {
      const { data } = await defaultApiClient.get<OrderResponse>(`/orders/active/tables/${id}`);
      return orderAdapter(data);
    } catch (error) {
      // Mesa libre sin orden activa: el backend responde 404. No es un error real,
      // significa que aún no hay pedido y debemos mostrar el CTA de crear.
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async addItemToOrder(orderId: number, productId: number, quantity: number = 1, notes?: string, isTakeaway?: boolean, selectedPrice?: number): Promise<OrderItem> {
    const { data } = await defaultApiClient.post<OrderItem>(`/orders/${orderId}/items`, { productId, quantity, notes, isTakeaway: isTakeaway ?? false, selectedPrice: selectedPrice ?? null });
    return data;
  }

  async updateOrderItem(orderId: number, itemId: number, quantity: number, notes?: string): Promise<void> {
    await defaultApiClient.put(`/orders/${orderId}/items/${itemId}`, { quantity, notes });
  }

  async removeOrderItem(orderId: number, itemId: number): Promise<void> {
    await defaultApiClient.delete<void>(`/orders/${orderId}/items/${itemId}`);
  }

  async payOrder(orderId: number, paymentMethod: string, idempotencyKey?: string): Promise<Order> {
    const { data } = await defaultApiClient.post<OrderResponse>(`/orders/${orderId}/pay/${paymentMethod}`, { idempotencyKey });
    return orderAdapter(data);
  }

  async payPartialOrder(orderId: number, amount: number, paymentMethod: string, idempotencyKey?: string): Promise<Order> {
    const { data } = await defaultApiClient.post<OrderResponse>(`/orders/${orderId}/pay-partial`, { amount, paymentMethod, idempotencyKey });
    return orderAdapter(data);
  }

  async changeOrderTable(orderId: number, destinationTableId: number): Promise<Order> {
    const { data } = await defaultApiClient.put<OrderResponse>(`/orders/${orderId}/table/${destinationTableId}`);
    return orderAdapter(data);
  }

  async releaseTable(id: number): Promise<Table> {
    const { data } = await defaultApiClient.post<TableResponse>(`/tables/${id}/release`);
    return tableAdapater(data);
  }
}
