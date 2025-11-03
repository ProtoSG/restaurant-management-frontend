import type { Product, ProductResponse } from "../models/Product.model";

export function ProductAdapter(product: ProductResponse): Product {
  return {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    price: product.price
  }
}
