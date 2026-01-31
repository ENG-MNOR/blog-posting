// import { create } from 'zustand';
// import { apiClient, setAuthTokenGetter, setRefreshHandler } from '@/api/client';
// import { User } from '@/types';

// interface AuthResponse {
//   accessToken: string;
//   user: User;
// }

// interface AuthState {
//   user: User | null;
//   accessToken: string | null;
//   status: 'idle' | 'loading' | 'authenticated';
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   refresh: () => Promise<string | null>;
// }

// export const useAuthStore = create<AuthState>((set, get) => ({
//   user: null,
//   accessToken: null,
//   status: 'idle',
//   login: async (email, password) => {
//     set({ status: 'loading' });
//     try {
//       const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
//       // const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password }, { withCredentials: true });
//       set({ user: data.user, accessToken: data.accessToken, status: 'authenticated' });
//     } catch (error) {
//       set({ status: 'idle' });
//       throw error;
//     }
//   },
//   logout: async () => {
//     await apiClient.post('/auth/logout');
//     set({ user: null, accessToken: null, status: 'idle' });
//   },
//   refresh: async () => {
//     set({ status: 'loading' });
//     try {
//       const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
//       set({ user: data.user, accessToken: data.accessToken, status: 'authenticated' });
//       return data.accessToken;
//     } catch (error) {
//       set({ user: null, accessToken: null, status: 'idle' });
//       return null;
//     }
//   }
// }));

// setAuthTokenGetter(() => useAuthStore.getState().accessToken);
// setRefreshHandler(() => useAuthStore.getState().refresh());


import { create } from 'zustand';
import { apiClient, setAuthTokenGetter, setRefreshHandler } from '@/api/client';
import { User } from '@/types';

interface AuthResponse {
  accessToken: string;
  user: User;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
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
      set({ status: 'idle' });
      throw error;
    }
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    set({ user: null, accessToken: null, status: 'idle' });
  },

  refresh: async () => {
    set({ status: 'loading' });
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
      set({ user: data.user, accessToken: data.accessToken, status: 'authenticated' });
      return data.accessToken;
    } catch (error) {
      set({ user: null, accessToken: null, status: 'unauthenticated' });
      return null;
    }
  }
}));

setAuthTokenGetter(() => useAuthStore.getState().accessToken);
setRefreshHandler(() => useAuthStore.getState().refresh());
