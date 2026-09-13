export interface OrderProduct {
  id: number;
  name: string;
  code?: string;
  price: number;
  category: {
    id: number;
    name: string;
  };
}

export interface OrderProductResponse {
  id: number;
  name: string;
  code?: string;
  price: number;
  category: {
    id: number;
    name: string;
  };
}
