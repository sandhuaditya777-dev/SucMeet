import { create } from 'zustand';
import { ChatMessage } from '@sucmeet/shared';

interface ChatStore {
  messages: ChatMessage[];
  unreadCount: number;
  isOpen: boolean;
  addMessage: (msg: ChatMessage) => void;
  markAllRead: () => void;
  togglePanel: () => void;
  setOpen: (open: boolean) => void;
  clear: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  unreadCount: 0,
  isOpen: false,

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
      unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
    })),

  markAllRead: () => set({ unreadCount: 0 }),

  togglePanel: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      unreadCount: !state.isOpen ? 0 : state.unreadCount,
    })),

  setOpen: (open) => set({ isOpen: open, unreadCount: open ? 0 : undefined }),

  clear: () => set({ messages: [], unreadCount: 0 }),
}));
