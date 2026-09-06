'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { RoomWithToken } from '@sucmeet/shared';
import { useLayoutStore } from '@/stores/layoutStore';
import { ChatPanel } from './ChatPanel';
import { ParticipantsPanel } from './ParticipantsPanel';
import { LobbyPanel } from './LobbyPanel';

type PanelId = 'chat' | 'participants' | 'lobby';

interface SidePanelProps {
  room: RoomWithToken;
  panel: PanelId;
}

const panelTitles: Record<PanelId, string> = {
  chat: 'Chat',
  participants: 'Participants',
  lobby: 'Waiting Room',
};

export function SidePanel({ room, panel }: SidePanelProps) {
  const { setPanel } = useLayoutStore();

  return (
    <motion.aside
      key={panel}
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="flex h-full flex-col overflow-hidden border-l border-border bg-card"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{panelTitles[panel]}</h2>
        <button
          onClick={() => setPanel(null)}
          className="rounded-lg p-1 transition hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {panel === 'chat' && <ChatPanel />}
        {panel === 'participants' && <ParticipantsPanel room={room} />}
        {panel === 'lobby' && <LobbyPanel room={room} />}
      </div>
    </motion.aside>
  );
}
