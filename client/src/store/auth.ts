import { create } from 'zustand';
import { apiClient, setAuthTokenGetter, setRefreshHandler } from '@/api/client';
import { User } from '@/types';

interface AuthResponse {
  accessToken: string;
  user: User;
}

type Status = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: Status;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
  setUser: (patch: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  status: 'idle',

  login: async (email, password) => {
    set({ status: 'loading' });
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      set({ user: data.user, accessToken: data.accessToken, status: 'authenticated' });
    } catch (error) {
      set({ status: 'unauthenticated' });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      set({ user: null, accessToken: null, status: 'unauthenticated' });
    }
  },

  refresh: async () => {
    set({ status: 'loading' });
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
      set({ user: data.user, accessToken: data.accessToken, status: 'authenticated' });
      return data.accessToken;
    } catch {
      set({ user: null, accessToken: null, status: 'unauthenticated' });
      return null;
    }
  },

  setUser: (patch) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...patch } });
  },
}));

setAuthTokenGetter(() => useAuthStore.getState().accessToken);
setRefreshHandler(() => useAuthStore.getState().refresh());
