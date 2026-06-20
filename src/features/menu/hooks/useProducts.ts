import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ProductServiceImpl } from "../services/ProductServiceImpl";
import type { Product } from "../types/Product";
import type { CreateProductRequest } from "../schemas/Product.schema";
import type { PaginatedResponse } from "@/shared/types/PaginatedResponse";

const DEFAULT_SIZE = 20;

export function useProducts(categoryId: number | null = null) {
  const queryClient = useQueryClient();
  const service = useMemo(() => new ProductServiceImpl(), []);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({ totalElements: 0, totalPages: 0 });

  const loadProducts = useCallback(async (currentPage = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const data: PaginatedResponse<Product> = categoryId !== null
        ? await service.getProductsByCategoryId(categoryId, currentPage, DEFAULT_SIZE)
        : await service.getAllProducts(currentPage, DEFAULT_SIZE);
      setProducts(data.content);
      setPagination({ totalElements: data.totalElements, totalPages: data.totalPages });
      setPage(data.page);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [service, categoryId]);

  useEffect(() => {
    loadProducts(0);
  }, [loadProducts]);

  const goToPage = useCallback((newPage: number) => {
    loadProducts(newPage);
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
      await loadProducts(page);
    } catch (err) {
      setError(err as Error);
      console.error('Error creating product:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, queryClient, loadProducts, page]);

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
      await loadProducts(page);
    } catch (err) {
      setError(err as Error);
      console.error('Error updating product:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, queryClient, loadProducts, page]);

  const deleteProduct = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await service.deleteProduct(id);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await loadProducts(page);
    } catch (err) {
      setError(err as Error);
      console.error('Error deleting product:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, queryClient, loadProducts, page]);

  const getProductById = useCallback((id: number): Product | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const toggleProductActive = useCallback(async (id: number): Promise<void> => {
    try {
      await service.toggleProductAvailability(id);
      await loadProducts(page);
    } catch (err) {
      console.error('Error toggling product active state:', err);
      throw err;
    }
  }, [service, loadProducts, page]);

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
    page,
    pagination,
    goToPage,
  };
}

export function useAvailableProducts() {
  const service = useMemo(() => new ProductServiceImpl(), []);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await service.getAllAvailableProducts();
      setProducts(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, isLoading, error };
}

