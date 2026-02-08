import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ContentBlock, EventItem, Message, Research, User } from '@/types';

export const useContent = (slug: 'home' | 'about') =>
  useQuery({
    queryKey: ['content', slug],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ContentBlock>(`/content/${slug}`);
        return data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return undefined;
        }
        throw error;
      }
    }
  });

export const useResearch = (params?: { topic?: string; year?: number }) =>
  useQuery({
    queryKey: ['research', 'public', params],
    queryFn: async () => {
      const queryParams = params
        ? Object.fromEntries(
          Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
        )
        : undefined;
      const { data } = await apiClient.get<Research[]>('/research', {
        params: queryParams
      });
      return data;
    }
  });

export const useDashboardResearch = (params?: { topic?: string; year?: number; status?: string }) =>
  useQuery({
    queryKey: ['research', 'dashboard', params],
    queryFn: async () => {
      const queryParams = params
        ? Object.fromEntries(
          Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
        )
        : undefined;
      const { data } = await apiClient.get<Research[]>('/research/dashboard', {
        params: queryParams
      });
      return data;
    }
  });

export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>('/auth/users');
      return data;
    }
  });

export const useEvents = (category?: 'upcoming' | 'past') =>
  useQuery({
    queryKey: ['events', category],
    queryFn: async () => {
      const { data } = await apiClient.get<EventItem[]>('/events', {
        params: category ? { category } : undefined
      });
      return data;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

export const useMessages = () =>
  useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data } = await apiClient.get<Message[]>('/messages');
      return data;
    }
  });

export const useMutateResearch = () => {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: ['research'] });
  return {
    create: useMutation({
      mutationFn: (payload: Partial<Research> | FormData) => apiClient.post('/research', payload),
      onSuccess: invalidate
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Research> | FormData }) =>
        apiClient.put(`/research/${id}`, data),
      onSuccess: invalidate
    }),
    remove: useMutation({
      mutationFn: (id: string) => apiClient.delete(`/research/${id}`),
      onSuccess: invalidate
    })
  };
};

export const useMutateEvents = () => {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: ['events'] });
  return {
    create: useMutation({
      mutationFn: (payload: FormData) =>
        apiClient.post('/events', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }),
      onSuccess: invalidate
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: FormData }) =>
        apiClient.put(`/events/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }),
      onSuccess: invalidate
    }),
    remove: useMutation({
      mutationFn: (id: string) => apiClient.delete(`/events/${id}`),
      onSuccess: invalidate
    })
  };
};

export const useMutateUsers = () => {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: ['users'] });
  return {
    create: useMutation({
      mutationFn: (payload: (Partial<User> & { password?: string }) | FormData) =>
        apiClient.post('/auth/users', payload),
      onSuccess: invalidate
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: (Partial<User> & { password?: string }) | FormData }) =>
        apiClient.put(`/auth/users/${id}`, data),
      onSuccess: invalidate
    }),
    remove: useMutation({
      mutationFn: (id: string) => apiClient.delete(`/auth/users/${id}`),
      onSuccess: invalidate
    })
  };
};

export const useMutateContent = (slug: 'home' | 'about') => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ContentBlock> | FormData) => {
      // FormData will automatically set Content-Type with boundary
      return apiClient.put(`/content/${slug}`, payload);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['content', slug] })
  });
};

export const useMutateMessages = () => {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: ['messages'] });

  return {
    markRead: useMutation({
      mutationFn: (id: string) => apiClient.patch(`/messages/${id}/read`),
      onSuccess: invalidate
    }),
    reply: useMutation({
      mutationFn: ({ id, reply }: { id: string; reply: string }) =>
        apiClient.post(`/messages/${id}/reply`, { message: reply }),
      onSuccess: invalidate
    })
  };
};

export const useContactMutation = () =>
  useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      requestType: string;
      message: string;
    }) => apiClient.post('/messages', payload)
  });

export const useProfileMutation = () => {
  const client = useQueryClient();
  return {
    updateProfile: useMutation({
      mutationFn: (data: { name: string; email: string }) => apiClient.put('/auth/profile', data),
      onSuccess: (data) => {
        // Update user in auth store if needed, or invalidate queries
        // Ideally we should update the auth store
      }
    }),
    updatePassword: useMutation({
      mutationFn: (data: { currentPassword: string; newPassword: string }) =>
        apiClient.put('/auth/password', data)
    })
  };
};
