'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRoomContext, useLocalParticipant } from '@livekit/components-react';
import { DataPacket_Kind } from 'livekit-client';
import { Send } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { ChatMessage } from '@sucmeet/shared';
import { timeAgo, cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export function ChatPanel() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const messages = useChatStore((s) => s.messages);
  const markAllRead = useChatStore((s) => s.markAllRead);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { markAllRead(); }, [markAllRead]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 500) return;

    const msg: ChatMessage = {
      id: uuidv4(),
      type: 'chat',
      text: trimmed,
      senderId: localParticipant.identity,
      senderName: localParticipant.name || 'You',
      timestamp: Date.now(),
    };

    const data = Buffer.from(JSON.stringify(msg));
    room.localParticipant.publishData(data, { reliable: true });

    // Also add locally
    useChatStore.getState().addMessage(msg);
    setText('');
  }, [room, localParticipant, text]);

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            No messages yet. Say hello! 👋
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === localParticipant.identity;
            return (
              <div
                key={msg.id}
                className={cn('flex flex-col gap-0.5', isOwn && 'items-end')}
              >
                <span className="text-[10px] text-muted-foreground">
                  {isOwn ? 'You' : msg.senderName}
                </span>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                    isOwn
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-muted text-foreground'
                  )}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Type a message…"
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition disabled:opacity-40 hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
