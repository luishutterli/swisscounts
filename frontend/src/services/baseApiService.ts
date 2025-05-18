import { apiClient } from "./apiClient";
import { getFullUrl } from "./apiConfig";
import type { Entity, PaginatedResponse, QueryParams, ServiceOperations } from "./types";

export class BaseApiService<T extends Entity> implements ServiceOperations<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(params?: QueryParams): Promise<PaginatedResponse<T>> {
    return apiClient.get<PaginatedResponse<T>>(getFullUrl(this.endpoint), {
      params,
    });
  }

  async getById(id: string): Promise<T> {
    return apiClient.get<T>(getFullUrl(`${this.endpoint}/${id}`));
  }

  async create(data: Omit<T, "id">): Promise<T> {
    return apiClient.post<T>(getFullUrl(this.endpoint), data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return apiClient.put<T>(getFullUrl(`${this.endpoint}/${id}`), data);
  }

  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(getFullUrl(`${this.endpoint}/${id}`));
  }
}
