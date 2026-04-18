import type { AxiosInstance } from "axios";
import defaultApiClient from "@/shared/utils/apiClient";
import type { IProductService } from "../types/IProductService";
import type { Product, ProductResponse } from "../types/Product";
import { ProductAdapter } from "../adapters/ProductAdapter";

export class ProductServiceImpl implements IProductService {
  constructor(
    private readonly apiClient: AxiosInstance = defaultApiClient
  ) {}

  async getAllProducts(): Promise<Product[]> {
    const { data } = await this.apiClient.get<ProductResponse[]>('/products');
    return data.map(ProductAdapter);
  }

  async getProductById(id: number): Promise<Product> {
    const { data } = await this.apiClient.get<ProductResponse>(`/products/${id}`);
    return ProductAdapter(data);
  }

  async getProductsByCategoryId(categoryId: number): Promise<Product[]> {
    const { data } = await this.apiClient.get<ProductResponse[]>(`/products/categories/${categoryId}`);
    return data.map(ProductAdapter);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const { data } = await this.apiClient.post<ProductResponse>('/products', product);
    return ProductAdapter(data);
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const { data } = await this.apiClient.put<ProductResponse>(`/products/${id}`, product);
    return ProductAdapter(data);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.apiClient.delete(`/products/${id}`);
  }
}
