'use client';

import { useCallback, useState } from 'react';
import {
  useLocalParticipant,
  useRoomContext,
} from '@livekit/components-react';
import { Track, DataPacket_Kind } from 'livekit-client';
import {
  Mic, MicOff, Video, VideoOff, Monitor,
  MessageSquare, Users, Smile, LogOut,
  MoreHorizontal,
} from 'lucide-react';
import { RoomWithToken } from '@sucmeet/shared';
import { useChatStore } from '@/stores/chatStore';
import { useLayoutStore } from '@/stores/layoutStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { v4 as uuidv4 } from 'uuid';

const EMOJIS = ['👋', '👍', '❤️', '😂', '😮', '👏', '🎉', '🤔'];

interface ToolbarProps {
  room: RoomWithToken;
  onLeave: () => void;
}

function ToolbarButton({
  children,
  label,
  active,
  danger,
  onClick,
  badge,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-150',
              active
                ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                : danger
                ? 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-white'
                : 'bg-muted text-foreground hover:bg-accent'
            )}
          >
            {children}
            {badge ? (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {badge > 9 ? '9+' : badge}
              </span>
            ) : null}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Toolbar({ room, onLeave }: ToolbarProps) {
  const lkRoom = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const { togglePanel, activePanel } = useLayoutStore();
  const unreadCount = useChatStore((s) => s.unreadCount);

  const isMicOn = localParticipant.isMicrophoneEnabled;
  const isCamOn = localParticipant.isCameraEnabled;
  const isSharing = localParticipant.isScreenShareEnabled;

  const toggleMic = useCallback(() => {
    localParticipant.setMicrophoneEnabled(!isMicOn);
  }, [localParticipant, isMicOn]);

  const toggleCam = useCallback(() => {
    localParticipant.setCameraEnabled(!isCamOn);
  }, [localParticipant, isCamOn]);

  const toggleShare = useCallback(async () => {
    if (isSharing) {
      await localParticipant.setScreenShareEnabled(false);
    } else {
      try {
        await localParticipant.setScreenShareEnabled(true);
      } catch {
        // User denied screen share
      }
    }
  }, [localParticipant, isSharing]);

  const sendReaction = useCallback(
    (emoji: string) => {
      const msg = JSON.stringify({
        type: 'reaction',
        id: uuidv4(),
        emoji,
        senderId: localParticipant.identity,
        senderName: localParticipant.name || 'You',
        timestamp: Date.now(),
      });
      lkRoom.localParticipant.publishData(Buffer.from(msg), { reliable: false });
    },
    [lkRoom, localParticipant]
  );

  const handleLeave = () => {
    lkRoom.disconnect();
    onLeave();
  };

  return (
    <div className="flex h-16 items-center justify-center gap-2 border-t border-border bg-card px-4">
      {/* Mic */}
      <ToolbarButton label={isMicOn ? 'Mute mic' : 'Unmute mic'} onClick={toggleMic}>
        {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-destructive" />}
      </ToolbarButton>

      {/* Camera */}
      <ToolbarButton label={isCamOn ? 'Turn off camera' : 'Turn on camera'} onClick={toggleCam}>
        {isCamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-destructive" />}
      </ToolbarButton>

      {/* Screen share */}
      <ToolbarButton
        label={isSharing ? 'Stop sharing' : 'Share screen'}
        active={isSharing}
        onClick={toggleShare}
      >
        <Monitor className="h-5 w-5" />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      {/* Chat */}
      <ToolbarButton
        label="Chat"
        active={activePanel === 'chat'}
        onClick={() => togglePanel('chat')}
        badge={unreadCount}
      >
        <MessageSquare className="h-5 w-5" />
      </ToolbarButton>

      {/* Participants */}
      <ToolbarButton
        label="Participants"
        active={activePanel === 'participants'}
        onClick={() => togglePanel('participants')}
      >
        <Users className="h-5 w-5" />
      </ToolbarButton>

      {/* Reactions */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground transition hover:bg-accent">
            <Smile className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" side="top">
          <div className="grid grid-cols-4 gap-1">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-xl transition hover:bg-accent"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="mx-1 h-6 w-px bg-border" />

      {/* Leave */}
      <ToolbarButton label="Leave meeting" danger onClick={handleLeave}>
        <LogOut className="h-5 w-5" />
      </ToolbarButton>
    </div>
  );
}
