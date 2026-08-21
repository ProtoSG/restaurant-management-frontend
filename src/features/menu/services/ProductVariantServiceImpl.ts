import defaultApiClient from "@/shared/utils/apiClient";
import type { ProductVariant } from "../types/Product";

export interface CreateVariantPayload {
  name: string;
  price: number;
  sortOrder: number;
}

export interface UpdateVariantPayload {
  name: string;
  price: number;
  sortOrder: number;
}

export class ProductVariantServiceImpl {
  async getByProductId(productId: number): Promise<ProductVariant[]> {
    const { data } = await defaultApiClient.get<ProductVariant[]>(`/products/${productId}/variants`);
    return data;
  }

  async getAvailableByProductId(productId: number): Promise<ProductVariant[]> {
    const { data } = await defaultApiClient.get<ProductVariant[]>(`/products/${productId}/variants/available`);
    return data;
  }

  async create(productId: number, payload: CreateVariantPayload): Promise<ProductVariant> {
    const { data } = await defaultApiClient.post<ProductVariant>(`/products/${productId}/variants`, payload);
    return data;
  }

  async update(variantId: number, payload: UpdateVariantPayload): Promise<ProductVariant> {
    const { data } = await defaultApiClient.put<ProductVariant>(`/products/0/variants/${variantId}`, payload);
    return data;
  }

  async delete(variantId: number): Promise<void> {
    await defaultApiClient.delete(`/products/0/variants/${variantId}`);
  }
}
