import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SplashCursorState {
  isEnabled: boolean;
  toggleSplashCursor: () => void;
}

export const useSplashCursorStore = create<SplashCursorState>()(
  persist(
    (set, get) => ({
      isEnabled: false,
      toggleSplashCursor: () => {
        const newState = !get().isEnabled;
        console.log('Toggling splash cursor:', newState);
        set({ isEnabled: newState });
      },
    }),
    {
      name: 'splash-cursor-storage',
    }
  )
);