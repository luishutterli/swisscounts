import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseApiService } from "../baseApiService";
import type { Entity, QueryParams } from "../types";

type WeightUnit = "t" | "kg" | "g";
type VolumeUnit = "l" | "cl" | "ml";
type LengthUnit = "m" | "cm" | "mm";

export interface IPrice {
  mwst: "brutto" | "netto";
  price: number;
  mwstPercent?: number;
  unit?: "Stück" | WeightUnit | VolumeUnit | LengthUnit;
}

export interface InventoryItem extends Entity {
  name: string;
  shortName?: string;
  description?: string;
  type: "product" | "service";
  price: IPrice;
  allowAmountDecimal?: boolean;
  imageURLs?: string[];
  primaryImage?: number;
  tags?: string[];
  inStockStatus?: boolean;
  properties?: {
    [key: string]: string | number | boolean;
  };
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  orgId?: number;
  state?: "active" | "deleted";
}

class InventoryItemService extends BaseApiService<InventoryItem> {
  constructor() {
    super("inventory/items");
  }
}

export const inventoryItemService = new InventoryItemService();

const INVENTORY_ITEMS_KEYS = {
  all: ["inventory-items"] as const,
  list: (params?: QueryParams) => [...INVENTORY_ITEMS_KEYS.all, "list", params] as const,
  detail: (id: string) => [...INVENTORY_ITEMS_KEYS.all, "detail", id] as const,
};

export function useInventoryItems(params?: QueryParams) {
  return useQuery({
    queryKey: INVENTORY_ITEMS_KEYS.list(params),
    queryFn: () => inventoryItemService.getAll(params),
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: INVENTORY_ITEMS_KEYS.detail(id),
    queryFn: () => inventoryItemService.getById(id),
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<InventoryItem, "id">) => inventoryItemService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_ITEMS_KEYS.all });
      queryClient.setQueryData(INVENTORY_ITEMS_KEYS.detail(data.id), data);
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      inventoryItemService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_ITEMS_KEYS.all });
      queryClient.setQueryData(INVENTORY_ITEMS_KEYS.detail(data.id), data);
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryItemService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_ITEMS_KEYS.all });
      queryClient.removeQueries({ queryKey: INVENTORY_ITEMS_KEYS.detail(id) });
    },
  });
}
