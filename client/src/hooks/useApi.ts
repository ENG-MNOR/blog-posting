import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { ContentBlock, EventItem, Message, Research, User } from '@/types';

export const queryKeys = {
  content: (slug: string) => ['content', slug] as const,
  research: (scope: 'public' | 'dashboard', params?: unknown) => ['research', scope, params] as const,
  events: (category?: string) => ['events', category ?? 'all'] as const,
  messages: () => ['messages'] as const,
  users: () => ['users'] as const,
};

const clean = (params?: Record<string, unknown>) =>
  params
    ? Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null),
      )
    : undefined;

/* ---------------------------------- Queries --------------------------------- */

export const useContent = (slug: 'home' | 'about') =>
  useQuery({
    queryKey: queryKeys.content(slug),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ContentBlock>(`/content/${slug}`);
        return data;
      } catch (error) {
        if ((error as { response?: { status?: number } }).response?.status === 404) return undefined;
        throw error;
      }
    },
  });

export const useResearch = (params?: { topic?: string; year?: number }) =>
  useQuery({
    queryKey: queryKeys.research('public', params),
    queryFn: async () => {
      const { data } = await apiClient.get<Research[]>('/research', { params: clean(params) });
      return data;
    },
  });

export const useDashboardResearch = (params?: { topic?: string; year?: number; status?: string }) =>
  useQuery({
    queryKey: queryKeys.research('dashboard', params),
    queryFn: async () => {
      const { data } = await apiClient.get<Research[]>('/research/dashboard', {
        params: clean(params),
      });
      return data;
    },
  });

export const useUsers = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.users(),
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>('/auth/users');
      return data;
    },
    enabled: options?.enabled ?? true,
  });

export const useEvents = (category?: 'upcoming' | 'past') =>
  useQuery({
    queryKey: queryKeys.events(category),
    queryFn: async () => {
      const { data } = await apiClient.get<EventItem[]>('/events', {
        params: category ? { category } : undefined,
      });
      return data;
    },
    refetchInterval: 60_000,
  });

export const useMessages = () =>
  useQuery({
    queryKey: queryKeys.messages(),
    queryFn: async () => {
      const { data } = await apiClient.get<Message[]>('/messages');
      return data;
    },
  });

/* --------------------------------- Mutations -------------------------------- */

export const useMutateResearch = () => {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: ['research'] });
  return {
    create: useMutation({
      mutationFn: (payload: Partial<Research>) =>
        apiClient.post<Research>('/research', payload).then((r) => r.data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Research> }) =>
        apiClient.put<Research>(`/research/${id}`, data).then((r) => r.data),
      // Optimistic: patch every cached research list.
      onMutate: async ({ id, data }) => {
        await client.cancelQueries({ queryKey: ['research'] });
        const snapshots = client.getQueriesData<Research[]>({ queryKey: ['research'] });
        for (const [key, list] of snapshots) {
          if (!list) continue;
          client.setQueryData<Research[]>(
            key,
            list.map((item) => (item._id === id ? { ...item, ...data } : item)),
          );
        }
        return { snapshots };
      },
      onError: (_e, _v, ctx) => {
        ctx?.snapshots.forEach(([key, list]) => client.setQueryData(key, list));
      },
      onSettled: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => apiClient.delete(`/research/${id}`),
      onMutate: async (id) => {
        await client.cancelQueries({ queryKey: ['research'] });
        const snapshots = client.getQueriesData<Research[]>({ queryKey: ['research'] });
        for (const [key, list] of snapshots) {
          if (!list) continue;
          client.setQueryData<Research[]>(
            key,
            list.filter((item) => item._id !== id),
          );
        }
        return { snapshots };
      },
      onError: (_e, _v, ctx) => {
        ctx?.snapshots.forEach(([key, list]) => client.setQueryData(key, list));
      },
      onSettled: invalidate,
    }),
  };
};

export const useMutateEvents = () => {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: ['events'] });
  return {
    create: useMutation({
      mutationFn: (payload: FormData) => apiClient.post('/events', payload),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: FormData }) =>
        apiClient.put(`/events/${id}`, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => apiClient.delete(`/events/${id}`),
      onSuccess: invalidate,
    }),
  };
};

export const useMutateUsers = () => {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: queryKeys.users() });
  return {
    create: useMutation({
      mutationFn: (payload: FormData | (Partial<User> & { password?: string })) =>
        apiClient.post('/auth/users', payload),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: string;
        data: FormData | (Partial<User> & { password?: string });
      }) => apiClient.put(`/auth/users/${id}`, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => apiClient.delete(`/auth/users/${id}`),
      onSuccess: invalidate,
    }),
  };
};

export const useMutateContent = (slug: 'home' | 'about') => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ContentBlock> | FormData) =>
      apiClient.put(`/content/${slug}`, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.content(slug) }),
  });
};

export const useMutateMessages = () => {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: queryKeys.messages() });

  const patchStatus = async (id: string, status: Message['status']) => {
    await client.cancelQueries({ queryKey: queryKeys.messages() });
    const previous = client.getQueryData<Message[]>(queryKeys.messages());
    if (previous) {
      client.setQueryData<Message[]>(
        queryKeys.messages(),
        previous.map((m) => (m._id === id ? { ...m, status } : m)),
      );
    }
    return { previous };
  };

  return {
    markRead: useMutation({
      mutationFn: (id: string) => apiClient.patch(`/messages/${id}/read`),
      onMutate: (id) => patchStatus(id, 'read'),
      onError: (_e, _v, ctx) => ctx?.previous && client.setQueryData(queryKeys.messages(), ctx.previous),
      onSettled: invalidate,
    }),
    markUnread: useMutation({
      mutationFn: (id: string) => apiClient.patch(`/messages/${id}/unread`),
      onMutate: (id) => patchStatus(id, 'unread'),
      onError: (_e, _v, ctx) => ctx?.previous && client.setQueryData(queryKeys.messages(), ctx.previous),
      onSettled: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => apiClient.delete(`/messages/${id}`),
      onSuccess: invalidate,
    }),
    reply: useMutation({
      mutationFn: ({ id, message }: { id: string; message: string }) =>
        apiClient.post(`/messages/${id}/reply`, { message }),
      onSuccess: invalidate,
    }),
  };
};

export const useProfileMutation = () => {
  const setUser = useAuthStore((s) => s.setUser);
  return {
    updateProfile: useMutation({
      mutationFn: (data: { name: string; email: string }) =>
        apiClient.put<{ user: User }>('/auth/profile', data).then((r) => r.data),
      onSuccess: (res) => {
        if (res?.user) setUser(res.user);
      },
    }),
    updatePassword: useMutation({
      mutationFn: (data: { currentPassword: string; newPassword: string }) =>
        apiClient.put('/auth/password', data),
    }),
  };
};

export const useContactMutation = () =>
  useMutation({
    mutationFn: (payload: { name: string; email: string; requestType: string; message: string }) =>
      apiClient.post('/messages', payload),
  });
