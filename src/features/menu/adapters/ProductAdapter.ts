import type { Product, ProductResponse } from '../types/Product';

export function ProductAdapter(product: ProductResponse): Product {
  return {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    price: product.price,
    active: product.active ?? true
  }
}
