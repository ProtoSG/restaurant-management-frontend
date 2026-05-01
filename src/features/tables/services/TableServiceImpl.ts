import { orderAdapter } from "../adapters/OrderAdapter";
import { orderItemAdapter } from "../adapters/OrderItemAdapter";
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

  async getOrderActive(id: number): Promise<Order> {
    const { data } = await defaultApiClient.get<OrderResponse>(`/orders/active/tables/${id}`);
    return orderAdapter(data);
  }

  async addItemToOrder(orderId: number, productId: number, quantity: number = 1, notes?: string): Promise<OrderItem> {
    const { data } = await defaultApiClient.post<OrderItem>(`/orders/${orderId}/items`, { productId, quantity, notes });
    return orderItemAdapter(data);
  }

  async updateOrderItem(orderId: number, itemId: number, quantity: number, notes?: string): Promise<OrderItem> {
    const { data } = await defaultApiClient.put<OrderItem>(`/orders/${orderId}/items/${itemId}`, { quantity, notes });
    return orderItemAdapter(data);
  }

  async removeOrderItem(orderId: number, itemId: number): Promise<void> {
    await defaultApiClient.delete<void>(`/orders/${orderId}/items/${itemId}`);
  }

  async payOrder(orderId: number, paymentMethod: string): Promise<Order> {
    const { data } = await defaultApiClient.post<OrderResponse>(`/orders/${orderId}/pay/${paymentMethod}`);
    return orderAdapter(data);
  }

  async payPartialOrder(orderId: number, amount: number, paymentMethod: string): Promise<Order> {
    const { data } = await defaultApiClient.post<OrderResponse>(`/orders/${orderId}/pay-partial`, { amount, paymentMethod });
    return orderAdapter(data);
  }

  async changeOrderTable(orderId: number, destinationTableId: number): Promise<Order> {
    const { data } = await defaultApiClient.put<OrderResponse>(`/orders/${orderId}/table/${destinationTableId}`);
    return orderAdapter(data);
  }
}
