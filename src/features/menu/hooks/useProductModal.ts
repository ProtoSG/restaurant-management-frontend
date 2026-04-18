import { useCallback, useState } from "react";
import type { Product } from "../types/Product";

export function useProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const openCreate = useCallback(() => {
    setSelectedProduct(null);
    setIsEdit(false);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((product: Product) => {
    console.log({product})
    setSelectedProduct(product);
    setIsEdit(true);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedProduct(null);
    setIsEdit(false);
  }, []);

  return {
    isOpen,
    selectedProduct,
    isEdit,
    openCreate,
    openEdit,
    close,
  };
}
