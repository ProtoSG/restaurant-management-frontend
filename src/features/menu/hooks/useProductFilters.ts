import { useCallback, useMemo, useState } from "react";
import type { Product } from "../types/Product";

export function useProductFilters(products: Product[]) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === null) {
      return products.sort((a, b) => a.id - b.id);
    }
    return products.filter(p => p.categoryId === selectedCategory);
  }, [products, selectedCategory]);

  const productsByCategory = useMemo(() => {
    const grouped: Record<number, Product[]> = {};
    products.forEach((product) => {
      if (!grouped[product.categoryId]) {
        grouped[product.categoryId] = [];
      }
      grouped[product.categoryId].push(product);
    });
    return grouped;
  }, [products]);

  const getCountByCategory = useCallback((categoryId: number): number => {
    return productsByCategory[categoryId]?.length || 0;
  }, [productsByCategory]);

  const clearFilter = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  return {
    selectedCategory,
    filteredProducts,
    productsByCategory,
    setSelectedCategory,
    getCountByCategory,
    clearFilter,
  };
}
