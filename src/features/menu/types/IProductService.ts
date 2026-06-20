import type { Product } from '../types/Product';
import type { PaginatedResponse } from '@/shared/types/PaginatedResponse';

export interface IProductService {
  getAllProducts(page?: number, size?: number): Promise<PaginatedResponse<Product>>;
  getAllAvailableProducts(): Promise<Product[]>;
  getAvailableProducts(page?: number, size?: number): Promise<PaginatedResponse<Product>>;
  getProductById(id: number): Promise<Product>;
  getProductsByCategoryId(categoryId: number, page?: number, size?: number): Promise<PaginatedResponse<Product>>;
  createProduct(product: Omit<Product, 'id'>): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product>;
  toggleProductAvailability(id: number): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
}
