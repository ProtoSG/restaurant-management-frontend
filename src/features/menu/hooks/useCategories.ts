import { useQuery } from "react-query";
import { CategoryServiceImpl } from "../services/CategoryServiceImpl";

const categoryService = new CategoryServiceImpl();

export function useCategories() {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories()
  });

  return { categories, isLoading, error };
}
