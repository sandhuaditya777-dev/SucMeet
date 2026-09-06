'use client';

import { Loader2, UserCheck, UserX } from 'lucide-react';
import { RoomWithToken } from '@sucmeet/shared';
import { useLobby } from '@/hooks/useLobby';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface LobbyPanelProps {
  room: RoomWithToken;
}

export function LobbyPanel({ room }: LobbyPanelProps) {
  const { data: participants, isLoading, refetch } = useLobby(room.id);

  const decide = async (participantId: string, action: 'accept' | 'deny') => {
    try {
      await apiClient.post(
        `/rooms/${room.id}/lobby/${participantId}/${action}`,
        {}
      );
      toast.success(action === 'accept' ? 'Participant admitted' : 'Participant denied');
      refetch();
    } catch {
      toast.error('Action failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const waiting = (participants ?? []).filter((p) => p.status === 'waiting');

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-xs text-muted-foreground">
        {waiting.length === 0
          ? 'No one is waiting to join.'
          : `${waiting.length} person${waiting.length !== 1 ? 's' : ''} waiting`}
      </p>

      <div className="space-y-2">
        {waiting.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3"
          >
            {/* Avatar */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: p.color }}
            >
              {p.username[0]?.toUpperCase()}
            </div>

            <span className="flex-1 truncate text-sm font-medium">{p.username}</span>

            {/* Accept / Deny */}
            <div className="flex gap-1.5">
              <button
                onClick={() => decide(p.id, 'accept')}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 transition hover:bg-emerald-500 hover:text-white"
                title="Admit"
              >
                <UserCheck className="h-4 w-4" />
              </button>
              <button
                onClick={() => decide(p.id, 'deny')}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/20 text-destructive transition hover:bg-destructive hover:text-white"
                title="Deny"
              >
                <UserX className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
