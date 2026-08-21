export interface ProductVariant {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
  sortOrder: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName?: string;
  active: boolean;
  variants: ProductVariant[];
}

export interface ProductVariantResponse {
  id: number;
  name: string;
  price: number;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  category?: { id: number; name: string };
  isAvailable?: boolean;
  variants?: ProductVariantResponse[];
}
