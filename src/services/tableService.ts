import { orderAdapter } from "../adapters/OrderAdapter";
import { orderItemAdapter } from "../adapters/OrderItemAdapter";
import { tableAdapater } from "../adapters/TableAdapter";
import { API_URL } from "../Config";
import type { Order } from "../models/Order.model";
import type { OrderItem } from "../models/OrderItem.model";
import type { CreateTableRequest, Table, TableResponse, UpdateTableRequest } from "../models/Table.model";

export class TableService {
  private readonly apiUrl = `${API_URL}/tables`;

  async getTables(): Promise<Table[]> {
    const response = await fetch(this.apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.status}`);
    }
    
    const data: TableResponse[] = await response.json();
    const tables = data.map(tableAdapater);

    return tables;
  }

  async update(id: number, table: UpdateTableRequest): Promise<Table> {
    const response = await fetch(`${this.apiUrl}/${id}`,{
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(table)
    })

    if (!response.ok) {
      throw new Error(`Fallo al actualizar la tabla: ${response.status}`);
    }

    const data = await response.json();
    return tableAdapater(data);
  }

  async create(table: CreateTableRequest): Promise<Table> {
    const response = await fetch(this.apiUrl,{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(table)
    })

    if (!response.ok) {
      throw new Error(`Fallo al actualizar la tabla: ${response.status}`);
    }

    const data = await response.json();
    return tableAdapater(data);
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`Fallo al eliminar la mesa: ${response.status}`);
    }
  }

  async createOrder(id: number): Promise<Order> {
    const response = await fetch(`${this.apiUrl}/${id}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json"}
    })

    if (!response.ok) {
      throw new Error(`Fallo al crear el pedido: ${response.status}`);
    }

    const data = await response.json();

    return orderAdapter(data);
  }

  async getOrderActive(id: number): Promise<Order> {
    const response = await fetch(`${this.apiUrl}/${id}/orders/active`);

    if (!response.ok) {
      throw new Error(`Fallo al obtnener el pedido actual: ${response.status}`);
    }

    const data = await response.json();

    return orderAdapter(data);
  }

  async addItemToOrder(tableId: number, productId: number, quantity: number = 1): Promise<OrderItem> {
    const response = await fetch(`${this.apiUrl}/${tableId}/orders/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity })
    });

    if (!response.ok) {
      throw new Error(`Fallo al agregar item al pedido: ${response.status}`);
    }

    const data = await response.json();
    return orderItemAdapter(data);
  }

  async updateOrderItem(tableId: number, itemId: number, quantity: number): Promise<OrderItem> {
    const response = await fetch(`${this.apiUrl}/${tableId}/orders/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity })
    });

    if (!response.ok) {
      throw new Error(`Fallo al actualizar item del pedido: ${response.status}`);
    }

    const data = await response.json();
    return orderItemAdapter(data);
  }

  async removeOrderItem(tableId: number, itemId: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${tableId}/orders/items/${itemId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`Fallo al eliminar item del pedido: ${response.status}`);
    }
  }

  async payOrder(orderId: number, paymentMethod: string): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${orderId}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethod })
    });

    if (!response.ok) {
      throw new Error(`Fallo al pagar el pedido: ${response.status}`);
    }

    const data = await response.json();
    return orderAdapter(data);
  }
}
