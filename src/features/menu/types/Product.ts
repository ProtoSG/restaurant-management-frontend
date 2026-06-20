export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName?: string;
  active: boolean;
}

export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  category?: { id: number; name: string };
  isAvailable?: boolean;
}
