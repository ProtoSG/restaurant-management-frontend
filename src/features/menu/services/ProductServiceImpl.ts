import type { AxiosInstance } from "axios";
import defaultApiClient from "@/shared/utils/apiClient";
import type { IProductService } from "../types/IProductService";
import type { Product, ProductResponse } from "../types/Product";
import type { PaginatedResponse } from "@/shared/types/PaginatedResponse";
import { ProductAdapter } from "../adapters/ProductAdapter";

export class ProductServiceImpl implements IProductService {
  constructor(
    private readonly apiClient: AxiosInstance = defaultApiClient
  ) {}

  async getAllProducts(page = 0, size = 20): Promise<PaginatedResponse<Product>> {
    const { data } = await this.apiClient.get<PaginatedResponse<ProductResponse>>('/products', { params: { page, size } });
    return {
      ...data,
      content: data.content.map(ProductAdapter),
    };
  }

  async getAvailableProducts(page = 0, size = 20): Promise<PaginatedResponse<Product>> {
    const { data } = await this.apiClient.get<PaginatedResponse<ProductResponse>>('/products/available', { params: { page, size } });
    return {
      ...data,
      content: data.content.map(ProductAdapter),
    };
  }

  async getAllAvailableProducts(): Promise<Product[]> {
    const { data } = await this.apiClient.get<PaginatedResponse<ProductResponse>>('/products/available', { params: { page: 0, size: 1000 } });
    return data.content.map(ProductAdapter);
  }

  async getProductById(id: number): Promise<Product> {
    const { data } = await this.apiClient.get<ProductResponse>(`/products/${id}`);
    return ProductAdapter(data);
  }

  async getProductsByCategoryId(categoryId: number, page = 0, size = 20): Promise<PaginatedResponse<Product>> {
    const { data } = await this.apiClient.get<PaginatedResponse<ProductResponse>>(`/products/categories/${categoryId}`, { params: { page, size } });
    return {
      ...data,
      content: data.content.map(ProductAdapter),
    };
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const { data } = await this.apiClient.post<ProductResponse>('/products', product);
    return ProductAdapter(data);
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const { data } = await this.apiClient.put<ProductResponse>(`/products/${id}`, product);
    return ProductAdapter(data);
  }

  async toggleProductAvailability(id: number): Promise<Product> {
    const { data } = await this.apiClient.patch<ProductResponse>(`/products/${id}/toggle`);
    return ProductAdapter(data);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.apiClient.delete(`/products/${id}`);
  }
}
