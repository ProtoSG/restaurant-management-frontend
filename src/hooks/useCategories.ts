import { useQuery } from "react-query";
import { CategoryService } from "../services/categoryService";

const categoryService = new CategoryService();

export function useCategories() {
  const { data: categories = [], isLoading, error } = useQuery(
    'categories',
    () => categoryService.getCategories()
  );

  return { categories, isLoading, error}
}
