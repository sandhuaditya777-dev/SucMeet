'use client';

import { useParticipants, useLocalParticipant } from '@livekit/components-react';
import { Mic, MicOff, Video, VideoOff, Crown, Shield } from 'lucide-react';
import { RoomWithToken } from '@sucmeet/shared';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface ParticipantsPanelProps {
  room: RoomWithToken;
}

export function ParticipantsPanel({ room }: ParticipantsPanelProps) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const kickParticipant = async (identity: string) => {
    if (!confirm(`Remove ${identity} from the room?`)) return;
    try {
      await apiClient.delete(
        `/rooms/${room.id}/participants/${identity}`
      );
      toast.success(`${identity} was removed`);
    } catch {
      toast.error('Failed to remove participant');
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <p className="mb-3 text-xs text-muted-foreground">
        {participants.length} participant{participants.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-1">
        {participants.map((p) => {
          const isLocal = p.identity === localParticipant.identity;
          const isMuted = !p.isMicrophoneEnabled;
          const camOff = !p.isCameraEnabled;

          return (
            <div
              key={p.identity}
              className="group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-accent"
            >
              {/* Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                {(p.name || p.identity)[0]?.toUpperCase()}
              </div>

              {/* Name */}
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">
                  {p.name || p.identity}
                  {isLocal && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">(you)</span>
                  )}
                </p>
              </div>

              {/* Status icons */}
              <div className="flex items-center gap-1">
                {isMuted && <MicOff className="h-3.5 w-3.5 text-muted-foreground" />}
                {camOff && <VideoOff className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>

              {/* Admin kick (only for others) */}
              {!isLocal && (
                <button
                  onClick={() => kickParticipant(p.identity)}
                  className="hidden rounded px-2 py-0.5 text-xs text-destructive transition group-hover:block hover:bg-destructive/10"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
