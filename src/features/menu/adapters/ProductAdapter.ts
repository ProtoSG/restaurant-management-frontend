import type { Product, ProductResponse } from '../types/Product';

export function ProductAdapter(product: ProductResponse): Product {
  return {
    id: product.id,
    name: product.name,
    categoryId: product.category?.id ?? 0,
    categoryName: product.category?.name,
    price: product.price,
    active: product.isAvailable ?? true,
    variants: (product.variants ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      isAvailable: v.isAvailable ?? true,
      sortOrder: v.sortOrder ?? 0,
    })),
  }
}
