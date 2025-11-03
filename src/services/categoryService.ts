import { categoryAdapter } from "../adapters/CategoryAdapter";
import { API_URL } from "../Config";
import type { Category, CategoryResponse } from "../models/Category.model";

export class CategoryService {
  private readonly apiUrl = `${API_URL}/categories`;

  async getCategories(): Promise<Category[]> {
    const response = await fetch(this.apiUrl);

    if (!response.ok) {
      throw new Error("Error al obtener las categorias");
    }

    const data: CategoryResponse[] = await response.json();
    return data.map(categoryAdapter);
  }
}
