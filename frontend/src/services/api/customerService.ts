import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseApiService } from "../baseApiService";
import type { Entity, QueryParams } from "../types";

export interface Customer extends Entity {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
}

class CustomerService extends BaseApiService<Customer> {
  constructor() {
    super("customers");
  }
}

export const customerService = new CustomerService();

const CUSTOMERS_KEYS = {
  all: ["customers"] as const,
  list: (params?: QueryParams) => [...CUSTOMERS_KEYS.all, "list", params] as const,
  detail: (id: string) => [...CUSTOMERS_KEYS.all, "detail", id] as const,
};

export function useCustomers(params?: QueryParams) {
  return useQuery({
    queryKey: CUSTOMERS_KEYS.list(params),
    queryFn: () => customerService.getAll(params),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: CUSTOMERS_KEYS.detail(id),
    queryFn: () => customerService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Customer, "id">) => customerService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEYS.all });
      queryClient.setQueryData(CUSTOMERS_KEYS.detail(data.id), data);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      customerService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEYS.all });
      queryClient.setQueryData(CUSTOMERS_KEYS.detail(data.id), data);
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEYS.all });
      queryClient.removeQueries({ queryKey: CUSTOMERS_KEYS.detail(id) });
    },
  });
}
