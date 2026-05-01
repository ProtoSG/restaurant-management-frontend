import type { Product, ProductResponse } from '../types/Product';

export function ProductAdapter(product: ProductResponse): Product {
  return {
    id: product.id,
    name: product.name,
    categoryId: product.category?.id ?? 0,
    categoryName: product.category?.name,
    price: product.price,
    active: product.active ?? true
  }
}
