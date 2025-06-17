import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseApiService } from "../baseApiService";
import type { Entity, QueryParams } from "../types";
import { apiClient } from "../apiClient";
import { getFullUrl } from "../apiConfig";

export interface ICouponValue {
  type: "percentage" | "fixed";
  value: number;
  maxDiscount?: number; // for percentage
}

export interface ICouponBooking {
  amount: number;
  usedAt: Date;
  invoiceId?: string;
}

export interface ICouponUsage {
  date: Date;
  invoiceId: string;
}

export interface Coupon extends Entity {
  code: string;
  name: string;
  description?: string;
  value: ICouponValue;
  status: "active" | "used" | "inactive";
  startDate?: string;
  expiryDate?: string;
  minimumSpend?: number;
  applicableItems?: string[];
  stackable?: boolean;

  // Discount specific
  maxUses?: number;
  maxUsesPerCustomer?: number;
  used?: ICouponUsage[];

  // Gift card specific
  price?: {
    price: number;
    mwst: "brutto" | "netto";
    mwstPercent?: number;
    unit?: string;
  };
  bookings?: ICouponBooking[];
  purchasedInvoiceId?: string;

  createdBy?: number;
  state: "active" | "deleted";
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

// Note: The backend doesn't have a validate endpoint yet, but we'll keep this for future use
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

// Note: The backend doesn't have delete functionality as per requirements
// This is kept for future implementation but won't be used in the current version
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
