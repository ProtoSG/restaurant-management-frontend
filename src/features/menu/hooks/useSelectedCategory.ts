import { useCallback, useState } from "react";
import type { Category } from "../types/Category";

export function useSelectedCategory() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const selectCategory = useCallback((category: Category) => {
    setSelectedCategory(category);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  return {
    selectedCategory,
    selectCategory,
    clearSelection,
  };
}
