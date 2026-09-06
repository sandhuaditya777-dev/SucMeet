'use client';

import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRoom } from '@/hooks/useRooms';
import { PreJoinScreen } from './PreJoinScreen';
import { ConferenceView } from './ConferenceView';

interface RoomPageClientProps {
  slug: string;
}

type Phase = 'loading' | 'prejoin' | 'conference' | 'left';

export function RoomPageClient({ slug }: RoomPageClientProps) {
  const { data: room, isLoading, isError, error } = useRoom(slug);
  const [phase, setPhase] = useState<Phase>('loading');

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading room…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !room) {
    const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">Room not found</h1>
          <p className="text-sm text-muted-foreground">
            {msg || 'This room does not exist or you do not have access to join.'}
          </p>
          <a href="/" className="text-sm font-medium text-primary hover:underline">
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  // Left state
  if (phase === 'left') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-semibold">You left the meeting</h1>
          <p className="text-muted-foreground">Hope it went well! 👋</p>
          <a
            href="/"
            className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  // Pre-join screen
  if (phase === 'loading' || phase === 'prejoin') {
    return (
      <PreJoinScreen
        room={room}
        onJoin={() => setPhase('conference')}
      />
    );
  }

  // Conference view
  return (
    <ConferenceView
      room={room}
      onLeave={() => setPhase('left')}
    />
  );
}
