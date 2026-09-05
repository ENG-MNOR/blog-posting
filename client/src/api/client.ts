import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

let tokenGetter = () => null as string | null;
let refreshHandler: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (getter: () => string | null) => {
  tokenGetter = getter;
};

export const setRefreshHandler = (handler: () => Promise<string | null>) => {
  refreshHandler = handler;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenGetter();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let the browser set multipart boundaries itself.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const url = originalRequest?.url ?? '';
    const isAuthRoute = url.includes('/auth/refresh') || url.includes('/auth/login');
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute &&
      refreshHandler
    ) {
      originalRequest._retry = true;
      try {
        const token = await refreshHandler();
        if (token) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch {
        /* fall through */
      }
    }
    return Promise.reject(error);
  },
);

export interface NormalizedError {
  message: string;
  status?: number;
  fieldErrors: Record<string, string>;
}

/** Turn any thrown value into a predictable shape for toasts and form errors. */
export const toApiError = (error: unknown): NormalizedError => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Array<{ path?: string; field?: string; message: string }> }
      | undefined;
    const fieldErrors: Record<string, string> = {};
    for (const item of data?.errors ?? []) {
      const key = item.path ?? item.field;
      if (key) fieldErrors[key] = item.message;
    }
    return {
      message: data?.message || error.message || 'Request failed',
      status: error.response?.status,
      fieldErrors,
    };
  }
  return { message: error instanceof Error ? error.message : 'Something went wrong', fieldErrors: {} };
};
