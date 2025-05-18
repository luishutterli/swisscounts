export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  apiVersion: "v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

const orgId = 1;

export const getFullUrl = (path: string): string => {
  return `${API_CONFIG.baseURL}/${API_CONFIG.apiVersion}/${orgId}/${path}`;
};
