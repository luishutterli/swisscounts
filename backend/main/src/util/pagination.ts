import type { Request } from "express";

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function getPaginationParams(req: Request): PaginationOptions {
  const page = Number.parseInt(req.query.page as string) || 1;
  const limit = Number.parseInt(req.query.limit as string) || 10;

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
  };
}

export function paginateArray<T>(
  items: T[],
  options: PaginationOptions,
): PaginatedResult<T> {
  const { page, limit } = options;
  const total = items.length;

  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);

  const data = items.slice(startIndex, endIndex);

  return {
    data,
    total,
    page,
    limit,
  };
}
