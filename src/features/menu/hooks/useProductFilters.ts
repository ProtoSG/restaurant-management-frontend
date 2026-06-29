import { useCallback, useState } from "react";

export function useProductFilters() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const clearFilter = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  return {
    selectedCategory,
    setSelectedCategory,
    clearFilter,
  };
}
