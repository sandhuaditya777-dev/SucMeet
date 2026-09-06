import { create } from 'zustand';
import { ReactionMessage } from '@sucmeet/shared';
import { v4 as uuidv4 } from 'uuid';

interface ActiveReaction extends ReactionMessage {
  x: number; // random horizontal position %
}

interface ReactionsStore {
  active: ActiveReaction[];
  addReaction: (msg: ReactionMessage) => void;
  removeReaction: (id: string) => void;
}

export const useReactionsStore = create<ReactionsStore>((set) => ({
  active: [],

  addReaction: (msg) => {
    const reaction: ActiveReaction = {
      ...msg,
      id: msg.id || uuidv4(),
      x: Math.random() * 80 + 10, // 10–90% horizontal
    };
    set((state) => ({ active: [...state.active, reaction] }));

    // Auto-remove after animation completes (2.5s)
    setTimeout(() => {
      set((state) => ({ active: state.active.filter((r) => r.id !== reaction.id) }));
    }, 2600);
  },

  removeReaction: (id) =>
    set((state) => ({ active: state.active.filter((r) => r.id !== id) })),
}));
