import type { Category } from '../types/Category';

export interface ICategoryService {
  getCategories(): Promise<Category[]>;
}
