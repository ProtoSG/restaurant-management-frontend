import type { Category, CategoryResponse } from '../types/Category';

export function CategoryAdapter(category: CategoryResponse): Category {
  return {
    id: category.id,
    name: category.name
  }
}
