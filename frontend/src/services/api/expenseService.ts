import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseApiService } from "../baseApiService";
import type { Entity, QueryParams } from "../types";

export interface Expense extends Entity {
  description: string;
  amount: number;
  category?: string;
  date: string;
  receiptImageURL?: string;
  notes?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  orgId?: number;
  state?: "active" | "deleted";
}

class ExpenseService extends BaseApiService<Expense> {
  constructor() {
    super("expenses");
  }
}

export const expenseService = new ExpenseService();

const EXPENSES_KEYS = {
  all: ["expenses"] as const,
  list: (params?: QueryParams) => [...EXPENSES_KEYS.all, "list", params] as const,
  detail: (id: string) => [...EXPENSES_KEYS.all, "detail", id] as const,
};

export function useExpenses(params?: QueryParams) {
  return useQuery({
    queryKey: EXPENSES_KEYS.list(params),
    queryFn: () => expenseService.getAll(params),
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: EXPENSES_KEYS.detail(id),
    queryFn: () => expenseService.getById(id),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Expense, "id">) => expenseService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEYS.all });
      queryClient.setQueryData(EXPENSES_KEYS.detail(data.id), data);
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) =>
      expenseService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEYS.all });
      queryClient.setQueryData(EXPENSES_KEYS.detail(data.id), data);
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEYS.all });
      queryClient.removeQueries({ queryKey: EXPENSES_KEYS.detail(id) });
    },
  });
}
