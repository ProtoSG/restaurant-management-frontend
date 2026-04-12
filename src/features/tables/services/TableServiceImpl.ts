import { orderAdapter } from "../adapters/OrderAdapter";
import { orderItemAdapter } from "../adapters/OrderItemAdapter";
import { tableAdapater } from "../adapters/TableAdapter";
import defaultApiClient from "@/shared/utils/apiClient";
import type { ITableService } from "../types/ITableService";
import type { Order } from "@/shared/types/Order";
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

  async createOrder(id: number): Promise<Order> {
    const { data } = await defaultApiClient.post<Order>(`/tables/${id}/orders`);
    return orderAdapter(data);
  }

  async getOrderActive(id: number): Promise<Order> {
    const { data } = await defaultApiClient.get<Order>(`/tables/${id}/orders/active`);
    return orderAdapter(data);
  }

  async addItemToOrder(tableId: number, productId: number, quantity: number = 1): Promise<OrderItem> {
    const { data } = await defaultApiClient.post<OrderItem>(`/tables/${tableId}/orders/items`, { productId, quantity });
    return orderItemAdapter(data);
  }

  async updateOrderItem(tableId: number, itemId: number, quantity: number): Promise<OrderItem> {
    const { data } = await defaultApiClient.put<OrderItem>(`/tables/${tableId}/orders/items/${itemId}`, { quantity });
    return orderItemAdapter(data);
  }

  async removeOrderItem(tableId: number, itemId: number): Promise<void> {
    await defaultApiClient.delete<void>(`/tables/${tableId}/orders/items/${itemId}`);
  }

  async payOrder(orderId: number, paymentMethod: string): Promise<Order> {
    const { data } = await defaultApiClient.post<Order>(`/orders/${orderId}/pay/${paymentMethod}`);
    return orderAdapter(data);
  }

  async payPartialOrder(orderId: number, amount: number, paymentMethod: string): Promise<Order> {
    const { data } = await defaultApiClient.post<Order>(`/orders/${orderId}/pay-partial`, { amount, paymentMethod });
    return orderAdapter(data);
  }

  async changeOrderTable(orderId: number, destinationTableId: number): Promise<Order> {
    const { data } = await defaultApiClient.put<Order>(`/orders/${orderId}/table/${destinationTableId}`);
    return orderAdapter(data);
  }
}
