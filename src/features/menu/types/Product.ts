export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  active: boolean;
}

export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  active?: boolean;
}
