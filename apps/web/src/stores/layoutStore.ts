import { create } from 'zustand';

type PanelId = 'chat' | 'participants' | 'lobby' | null;
type LayoutMode = 'grid' | 'focus';

interface LayoutStore {
  activePanel: PanelId;
  layoutMode: LayoutMode;
  setPanel: (panel: PanelId) => void;
  togglePanel: (panel: Exclude<PanelId, null>) => void;
  setLayoutMode: (mode: LayoutMode) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  activePanel: null,
  layoutMode: 'grid',

  setPanel: (panel) => set({ activePanel: panel }),

  togglePanel: (panel) =>
    set((state) => ({
      activePanel: state.activePanel === panel ? null : panel,
    })),

  setLayoutMode: (mode) => set({ layoutMode: mode }),
}));
