'use client';

import { useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { DataChannelMessage, ChatMessage, ReactionMessage } from '@sucmeet/shared';
import { useChatStore } from '@/stores/chatStore';
import { useReactionsStore } from '@/stores/reactionsStore';
import toast from 'react-hot-toast';

/**
 * Invisible component that listens on the LiveKit data channel
 * and dispatches messages to the appropriate Zustand stores.
 */
export function DataChannelListener() {
  const room = useRoomContext();
  const addMessage = useChatStore((s) => s.addMessage);
  const addReaction = useReactionsStore((s) => s.addReaction);

  useEffect(() => {
    const decoder = new TextDecoder();

    const handleData = (payload: Uint8Array) => {
      try {
        const raw = decoder.decode(payload);
        const msg: DataChannelMessage = JSON.parse(raw);

        switch (msg.type) {
          case 'chat':
            addMessage(msg as ChatMessage);
            break;

          case 'reaction':
            addReaction(msg as ReactionMessage);
            break;

          case 'lobby_decision':
            if (msg.status === 'accepted') {
              toast.success('You have been admitted to the room!');
            } else {
              toast.error('Your request to join was denied.');
            }
            break;
        }
      } catch {
        // Ignore non-JSON data
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room, addMessage, addReaction]);

  return null;
}
