import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = tokenGetter();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Don't override Content-Type for FormData - browser sets it automatically with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshHandler
    ) {
      originalRequest._retry = true;
      try {
        const token = await refreshHandler();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch {
        // swallow
      }
    }
    return Promise.reject(error);
  }
);





