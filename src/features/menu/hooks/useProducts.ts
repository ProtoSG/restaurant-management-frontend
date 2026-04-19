import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ProductServiceImpl } from "../services/ProductServiceImpl";
import type { Product } from "../types/Product";
import type { CreateProductRequest } from "../schemas/Product.schema";

export function useProducts() {
  const queryClient = useQueryClient();
  const service = useMemo(() => new ProductServiceImpl(), []);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await service.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const createProduct = useCallback(async (data: CreateProductRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const productData: Omit<Product, 'id'> = {
        name: data.name,
        price: parseFloat(data.price),
        categoryId: parseInt(data.categoryId),
        active: true
      };

      await service.createProduct(productData);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await loadProducts();
    } catch (err) {
      setError(err as Error);
      console.error('Error creating product:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, queryClient, loadProducts]);

  const updateProduct = useCallback(async (id: number, data: CreateProductRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const productData: Partial<Product> = {
        name: data.name,
        price: parseFloat(data.price),
        categoryId: parseInt(data.categoryId)
      };

      await service.updateProduct(id, productData);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await loadProducts();
    } catch (err) {
      setError(err as Error);
      console.error('Error updating product:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, queryClient, loadProducts]);

  const deleteProduct = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await service.deleteProduct(id);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await loadProducts();
    } catch (err) {
      setError(err as Error);
      console.error('Error deleting product:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, queryClient, loadProducts]);

  const getProductById = useCallback((id: number): Product | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const toggleProductActive = useCallback(async (id: number, currentActive: boolean): Promise<void> => {
    try {
      await service.updateProduct(id, { active: !currentActive });
      await loadProducts();
    } catch (err) {
      console.error('Error toggling product active state:', err);
      throw err;
    }
  }, [service, loadProducts]);

  return {
    products,
    isLoading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    toggleProductActive,
  };
}

export function useProductsByCategoryId(categoryId: number) {
  const { products, isLoading, error } = useProducts();
  
  const filteredProducts = useMemo(() => {
    if (!categoryId) return [];
    return products.filter(p => p.categoryId === categoryId);
  }, [products, categoryId]);

  return {
    products: filteredProducts,
    isLoading,
    error
  };
}
