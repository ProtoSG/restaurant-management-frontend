import { ProductAdapter } from "../adapters/ProductAdapter";
import { API_URL } from "../Config"
import type { Product } from "../models/Product.model";

export class ProductService {
  private readonly apiUrl = `${API_URL}/products`;

  async getProductsByCategoryId(id: number) {
    const response = await fetch(`${this.apiUrl}/categories/${id}`);

    if (!response.ok) {
      throw new Error("Error al obtener los productos")
    }

    const data: Product[] = await response.json();

    return data.map(ProductAdapter);
  }
}
