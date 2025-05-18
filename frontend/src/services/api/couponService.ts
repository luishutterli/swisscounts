import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseApiService } from "../baseApiService";
import type { Entity, QueryParams } from "../types";
import { apiClient } from "../apiClient";
import { getFullUrl } from "../apiConfig";

export interface Coupon extends Entity {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

class CouponService extends BaseApiService<Coupon> {
  constructor() {
    super("coupons");
  }
}

export const couponService = new CouponService();

const COUPONS_KEYS = {
  all: ["coupons"] as const,
  list: (params?: QueryParams) => [...COUPONS_KEYS.all, "list", params] as const,
  detail: (id: string) => [...COUPONS_KEYS.all, "detail", id] as const,
  validate: (code: string) => [...COUPONS_KEYS.all, "validate", code] as const,
};

export function useCoupons(params?: QueryParams) {
  return useQuery({
    queryKey: COUPONS_KEYS.list(params),
    queryFn: () => couponService.getAll(params),
  });
}

export function useCoupon(id: string) {
  return useQuery({
    queryKey: COUPONS_KEYS.detail(id),
    queryFn: () => couponService.getById(id),
    enabled: !!id,
  });
}

export function useValidateCoupon(code: string) {
  return useQuery({
    queryKey: COUPONS_KEYS.validate(code),
    queryFn: () => apiClient.get<Coupon>(getFullUrl(`coupons/validate/${code}`)),
    enabled: !!code,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Coupon, "id">) => couponService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: COUPONS_KEYS.all });
      queryClient.setQueryData(COUPONS_KEYS.detail(data.id), data);
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Coupon> }) =>
      couponService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: COUPONS_KEYS.all });
      queryClient.setQueryData(COUPONS_KEYS.detail(data.id), data);
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: COUPONS_KEYS.all });
      queryClient.removeQueries({ queryKey: COUPONS_KEYS.detail(id) });
    },
  });
}
