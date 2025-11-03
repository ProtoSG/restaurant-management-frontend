import type { Category, CategoryResponse } from "../models/Category.model";

export function categoryAdapter(category: CategoryResponse): Category {
  return {
    id: category.id,
    name: category.name
  }
}
