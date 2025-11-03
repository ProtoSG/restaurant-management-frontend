import { useQuery } from "react-query";
import { ProductService } from "../services/productService"

const productService = new ProductService();

export function useProductsByCategoryId(id: number) {
  const { data: products = [], isLoading, error } = useQuery(
    `products-by-category-${id}`,
    () => productService.getProductsByCategoryId(id)
  );

  return { products, isLoading, error };
}
