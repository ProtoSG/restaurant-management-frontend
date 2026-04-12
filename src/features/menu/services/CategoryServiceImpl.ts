import defaultApiClient from "@/shared/utils/apiClient";
import type { ICategoryService } from "../types/ICategoryService";
import type { Category, CategoryResponse } from "../types/Category";
import { CategoryAdapter } from "../adapters/CategoryAdapter";

export class CategoryServiceImpl implements ICategoryService {
  async getCategories(): Promise<Category[]> {
    const { data } = await defaultApiClient.get<CategoryResponse[]>("/categories");
    return data.map(CategoryAdapter);
  }
}
