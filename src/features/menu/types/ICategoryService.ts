import type { Category } from '../types/Category';

export interface ICategoryService {
  getCategories(): Promise<Category[]>;
  createCategory(name: string): Promise<Category>;
  updateCategory(id: number, name: string): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
}
