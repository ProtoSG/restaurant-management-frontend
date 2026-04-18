import type { Table } from "../types/Table";
import type { Order } from "@/shared/types/Order";
import type { OrderItem } from "@/shared/types/OrderItem";
import type { CreateTableRequest, UpdateTableRequest } from "../schemas/Table.schema";

export interface ITableService {
  getTables(): Promise<Table[]>;
  create(table: CreateTableRequest): Promise<Table>;
  update(id: number, table: UpdateTableRequest): Promise<Table>;
  delete(id: number): Promise<void>;
  
  createOrder(tableId: number): Promise<Order>;
  getOrderActive(tableId: number): Promise<Order>;
  
  addItemToOrder(tableId: number, productId: number, quantity?: number): Promise<OrderItem>;
  updateOrderItem(tableId: number, itemId: number, quantity: number): Promise<OrderItem>;
  removeOrderItem(tableId: number, itemId: number): Promise<void>;
  
  payOrder(orderId: number, paymentMethod: string): Promise<Order>;
  payPartialOrder(orderId: number, amount: number, paymentMethod: string): Promise<Order>;
  
  changeOrderTable(orderId: number, destinationTableId: number): Promise<Order>;
}
