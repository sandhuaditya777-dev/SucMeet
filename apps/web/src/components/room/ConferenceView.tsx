'use client';

import { useCallback } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { RoomWithToken } from '@sucmeet/shared';
import { useUserChoicesStore } from '@/stores/userChoicesStore';
import { RoomUI } from './RoomUI';
import { DataChannelListener } from './DataChannelListener';

interface ConferenceViewProps {
  room: RoomWithToken;
  onLeave: () => void;
}

export function ConferenceView({ room, onLeave }: ConferenceViewProps) {
  const { micEnabled, camEnabled, displayName } = useUserChoicesStore();

  const handleDisconnected = useCallback(() => {
    onLeave();
  }, [onLeave]);

  return (
    <LiveKitRoom
      serverUrl={room.livekit.url}
      token={room.livekit.token}
      connect={true}
      audio={micEnabled}
      video={camEnabled}
      onDisconnected={handleDisconnected}
      className="h-screen w-full"
      data-lk-theme="default"
    >
      <RoomAudioRenderer />
      <DataChannelListener />
      <RoomUI room={room} onLeave={onLeave} />
    </LiveKitRoom>
  );
}
