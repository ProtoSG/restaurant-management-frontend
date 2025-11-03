import { create } from "zustand";
import type { Category } from "../models/Category.model";

interface CategoryStatus {
  category: Category;
  setCategory: (category: Category) => void;
}

export const useCategoryStore = create<CategoryStatus>((set) => ({
  category: {} as Category,
  setCategory: (category: Category) => set({category})
}))
