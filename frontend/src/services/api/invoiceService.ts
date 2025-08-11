import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseApiService } from "../baseApiService";
import type { Entity, QueryParams } from "../types";

export interface IInvoicePrice {
  mwst: "brutto" | "netto";
  price: number;
  mwstPercent?: number;
  unit?: "Stück" | "t" | "kg" | "g" | "l" | "cl" | "ml" | "m" | "cm" | "mm";
}

export interface IInvoicePosition {
  positionId: number;
  amount: number;
  settledPrice: IInvoicePrice;
  inventoryItemId?: string;
  customItem?: {
    name: string;
    description?: string;
  };
}

export interface IPaymentInformation {
  paidAt: string;
  paymentMethod: "cash" | "twint" | "other";
  paymentStatus: "pending" | "completed" | "failed";
  transactionId?: string;
  paymentDetails?: { [key: string]: string | number | boolean };
}

export interface IAppliedCoupon {
  couponId: string;
  appliedAt: string;
  discountApplied: number;
}

export interface IInvoiceAddress {
  street?: string;
  city?: string;
  canton?: string;
  postalCode?: string;
  country?: string;
  email?: string;
  phone?: string;
}

export interface Invoice extends Entity {
  invoiceId: number;
  customerId: string;
  description?: string;
  text?: string;
  notes?: string;
  positions: IInvoicePosition[];
  appliedCoupons?: IAppliedCoupon[];
  paymentInformation?: IPaymentInformation;
  issuedAt: string;
  dueAt: string;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "canceled";
  billingAddress?: IInvoiceAddress;
  shippingAddress?: IInvoiceAddress;
  createdBy?: number;
  state?: "active" | "deleted";
}

class InvoiceService extends BaseApiService<Invoice> {
  constructor() {
    super("invoices");
  }
}

export const invoiceService = new InvoiceService();

const INVOICES_KEYS = {
  all: ["invoices"] as const,
  list: (params?: QueryParams) => [...INVOICES_KEYS.all, "list", params] as const,
  detail: (id: string) => [...INVOICES_KEYS.all, "detail", id] as const,
  byCustomer: (customerId: string) =>
    [...INVOICES_KEYS.all, "customer", customerId] as const,
};

export function useInvoices(params?: QueryParams) {
  return useQuery({
    queryKey: INVOICES_KEYS.list(params),
    queryFn: () => invoiceService.getAll(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: INVOICES_KEYS.detail(id),
    queryFn: () => invoiceService.getById(id),
    enabled: !!id,
  });
}

export function useInvoicesByCustomer(customerId: string, params?: QueryParams) {
  return useQuery({
    queryKey: INVOICES_KEYS.byCustomer(customerId),
    queryFn: () =>
      invoiceService.getAll({
        ...params,
        filter: { ...params?.filter, customerId },
      }),
    enabled: !!customerId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Invoice, "id">) => invoiceService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEYS.all });
      if (data.customerId) {
        queryClient.invalidateQueries({
          queryKey: INVOICES_KEYS.byCustomer(data.customerId),
        });
      }
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
      invoiceService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEYS.all });
      queryClient.setQueryData(INVOICES_KEYS.detail(data.id), data);
      if (data.customerId) {
        queryClient.invalidateQueries({
          queryKey: INVOICES_KEYS.byCustomer(data.customerId),
        });
      }
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEYS.all });
      queryClient.removeQueries({ queryKey: INVOICES_KEYS.detail(id) });
    },
  });
}
