import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Room, RoomWithToken, RoomMember, ApiResponse } from '@sucmeet/shared';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Query Key Factory ─────────────────────────────────────────────────────────
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  detail: (slug: string) => [...roomKeys.all, 'detail', slug] as const,
  members: (id: string) => [...roomKeys.all, 'members', id] as const,
};

// ─── List user's rooms ─────────────────────────────────────────────────────────
export function useRooms() {
  return useQuery({
    queryKey: roomKeys.lists(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Room[]>>('/rooms');
      return res.data.data;
    },
  });
}

// ─── Get single room with LiveKit token ───────────────────────────────────────
export function useRoom(slug: string) {
  return useQuery({
    queryKey: roomKeys.detail(slug),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<RoomWithToken>>(`/rooms/${slug}`);
      return res.data.data;
    },
    enabled: Boolean(slug),
    staleTime: 60_000, // token valid for 2h, but refetch after 1 min
  });
}

// ─── Create room ───────────────────────────────────────────────────────────────
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      accessLevel?: string;
      config?: Record<string, unknown>;
    }) => {
      const res = await apiClient.post<ApiResponse<Room>>('/rooms', data);
      return res.data.data;
    },
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      toast.success(`Room "${room.name}" created!`);
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Failed to create room'
        : 'Failed to create room';
      toast.error(msg);
    },
  });
}

// ─── Update room ───────────────────────────────────────────────────────────────
export function useUpdateRoom(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiClient.patch<ApiResponse<Room>>(`/rooms/${roomId}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
      toast.success('Room updated');
    },
    onError: () => toast.error('Failed to update room'),
  });
}

// ─── Delete room ───────────────────────────────────────────────────────────────
export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      await apiClient.delete(`/rooms/${roomId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      toast.success('Room deleted');
    },
    onError: () => toast.error('Failed to delete room'),
  });
}

// ─── List room members ─────────────────────────────────────────────────────────
export function useRoomMembers(roomId: string) {
  return useQuery({
    queryKey: roomKeys.members(roomId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<RoomMember[]>>(`/rooms/${roomId}/members`);
      return res.data.data;
    },
    enabled: Boolean(roomId),
  });
}

// ─── Remove member ─────────────────────────────────────────────────────────────
export function useRemoveMember(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/rooms/${roomId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.members(roomId) });
      toast.success('Member removed');
    },
    onError: () => toast.error('Failed to remove member'),
  });
}

// ─── Send invitation ───────────────────────────────────────────────────────────
export function useSendInvitation() {
  return useMutation({
    mutationFn: async ({ roomId, email, role }: { roomId: string; email: string; role?: string }) => {
      const res = await apiClient.post(`/invitations/rooms/${roomId}`, { email, role });
      return res.data.data;
    },
    onSuccess: (_, vars) => toast.success(`Invitation sent to ${vars.email}`),
    onError: () => toast.error('Failed to send invitation'),
  });
}
