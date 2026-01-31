import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ContentBlock, EventItem, Message, Research } from '@/types';

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
    queryKey: ['research', params],
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

export const useEvents = (category?: 'upcoming' | 'past') =>
  useQuery({
    queryKey: ['events', category],
    queryFn: async () => {
      const { data } = await apiClient.get<EventItem[]>('/events', {
        params: category ? { category } : undefined
      });
      return data;
    }
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
      mutationFn: (payload: Partial<Research>) => apiClient.post('/research', payload),
      onSuccess: invalidate
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Research> }) =>
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
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/messages/${id}/read`),
    onSuccess: () => client.invalidateQueries({ queryKey: ['messages'] })
  });
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

