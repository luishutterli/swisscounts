import { useQuery } from "@tanstack/react-query";
import { BaseApiService } from "../baseApiService";
import { apiClient } from "../apiClient";
import { getFullUrl } from "../apiConfig";
import type { Entity, QueryParams } from "../types";

export interface BookkeepingEntry extends Entity {
  date: string;
  description: string;
  type: "income" | "expense";
  amount: number;
  category?: string;
  sourceId: string;
  sourceType: "expense" | "invoice";
}

export interface BookkeepingSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}

export interface BookkeepingResponse {
  data: BookkeepingEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: BookkeepingSummary;
}

class BookkeepingService extends BaseApiService<BookkeepingEntry> {
  constructor() {
    super("bookkeeping");
  }

  async getBookkeepingData(params?: QueryParams): Promise<BookkeepingResponse> {
    return apiClient.get<BookkeepingResponse>(getFullUrl(this.endpoint), { params });
  }

  async getSummary(): Promise<BookkeepingSummary> {
    return apiClient.get<BookkeepingSummary>(getFullUrl(`${this.endpoint}/summary`));
  }
}

export const bookkeepingService = new BookkeepingService();

const BOOKKEEPING_KEYS = {
  all: ["bookkeeping"] as const,
  list: (params?: QueryParams) => [...BOOKKEEPING_KEYS.all, "list", params] as const,
  summary: ["bookkeeping", "summary"] as const,
};

export function useBookkeepingEntries(params?: QueryParams) {
  return useQuery({
    queryKey: BOOKKEEPING_KEYS.list(params),
    queryFn: () => bookkeepingService.getBookkeepingData(params),
  });
}

export function useBookkeepingSummary() {
  return useQuery({
    queryKey: BOOKKEEPING_KEYS.summary,
    queryFn: () => bookkeepingService.getSummary(),
  });
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-CH");
};
