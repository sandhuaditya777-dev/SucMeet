import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { LobbyParticipant, ApiResponse } from '@sucmeet/shared';

export function useLobby(roomId: string, enabled = true) {
  return useQuery({
    queryKey: ['lobby', roomId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<LobbyParticipant[]>>(
        `/rooms/${roomId}/lobby`
      );
      return res.data.data;
    },
    enabled: Boolean(roomId) && enabled,
    refetchInterval: 3000, // poll every 3 seconds
    refetchIntervalInBackground: false,
  });
}
