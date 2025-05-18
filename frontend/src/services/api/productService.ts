import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseApiService } from "../baseApiService";
import type { Entity, QueryParams } from "../types";

export interface Product extends Entity {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  inStock: boolean;
}

class ProductService extends BaseApiService<Product> {
  constructor() {
    super("products");
  }
}

export const productService = new ProductService();

const PRODUCTS_KEYS = {
  all: ["products"] as const,
  list: (params?: QueryParams) => [...PRODUCTS_KEYS.all, "list", params] as const,
  detail: (id: string) => [...PRODUCTS_KEYS.all, "detail", id] as const,
  byCategory: (category: string) => [...PRODUCTS_KEYS.all, "category", category] as const,
};

export function useProducts(params?: QueryParams) {
  return useQuery({
    queryKey: PRODUCTS_KEYS.list(params),
    queryFn: () => productService.getAll(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: PRODUCTS_KEYS.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}

export function useProductsByCategory(category: string, params?: QueryParams) {
  return useQuery({
    queryKey: PRODUCTS_KEYS.byCategory(category),
    queryFn: () =>
      productService.getAll({
        ...params,
        filter: { ...params?.filter, category },
      }),
    enabled: !!category,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Product, "id">) => productService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEYS.all });
      queryClient.setQueryData(PRODUCTS_KEYS.detail(data.id), data);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEYS.all });
      queryClient.setQueryData(PRODUCTS_KEYS.detail(data.id), data);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEYS.all });
      queryClient.removeQueries({ queryKey: PRODUCTS_KEYS.detail(id) });
    },
  });
}
