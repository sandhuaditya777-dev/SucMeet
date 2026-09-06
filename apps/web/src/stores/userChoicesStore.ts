import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserChoices {
  micEnabled: boolean;
  camEnabled: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
  audioOutputDeviceId?: string;
  displayName: string;
}

interface UserChoicesStore extends UserChoices {
  setMic: (enabled: boolean) => void;
  setCam: (enabled: boolean) => void;
  setAudioDevice: (id: string) => void;
  setVideoDevice: (id: string) => void;
  setAudioOutput: (id: string) => void;
  setDisplayName: (name: string) => void;
}

export const useUserChoicesStore = create<UserChoicesStore>()(
  persist(
    (set) => ({
      micEnabled: true,
      camEnabled: true,
      displayName: '',

      setMic: (enabled) => set({ micEnabled: enabled }),
      setCam: (enabled) => set({ camEnabled: enabled }),
      setAudioDevice: (id) => set({ audioDeviceId: id }),
      setVideoDevice: (id) => set({ videoDeviceId: id }),
      setAudioOutput: (id) => set({ audioOutputDeviceId: id }),
      setDisplayName: (name) => set({ displayName: name }),
    }),
    { name: 'sucmeet-user-choices' }
  )
);
