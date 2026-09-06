'use client';

import { useState } from 'react';
import { useParticipants, useLocalParticipant } from '@livekit/components-react';
import { AnimatePresence } from 'framer-motion';
import { RoomWithToken } from '@sucmeet/shared';
import { useLayoutStore } from '@/stores/layoutStore';
import { ParticipantGrid } from './ParticipantGrid';
import { Toolbar } from './Toolbar';
import { SidePanel } from './SidePanel';
import { ReactionOverlay } from './ReactionOverlay';

interface RoomUIProps {
  room: RoomWithToken;
  onLeave: () => void;
}

export function RoomUI({ room, onLeave }: RoomUIProps) {
  const { activePanel } = useLayoutStore();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Main content area: grid + optional side panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Participant grid */}
        <div className="relative flex-1 overflow-hidden">
          <ParticipantGrid />
          {/* Floating reaction emojis */}
          <ReactionOverlay />
        </div>

        {/* Side panel */}
        <AnimatePresence>
          {activePanel && (
            <SidePanel room={room} panel={activePanel} />
          )}
        </AnimatePresence>
      </div>

      {/* Toolbar at bottom */}
      <Toolbar room={room} onLeave={onLeave} />
    </div>
  );
}
