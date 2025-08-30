// src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,            // { email, token } or null
      rememberMe: false,     // whether to persist user
      hasHydrated: false,    // hydration guard for routing

      // UI helpers
      setRememberMe: (remember) => set({ rememberMe: remember }),
      setHasHydrated: (v) => set({ hasHydrated: v }),

      // Auth actions
      login: (user, remember) => {
        set({ user, rememberMe: remember });
      },
      logout: () => {
        set({ user: null, rememberMe: false });
      },
    }),
    {
      name: 'auth', // avoid clashing with old "userInfo" key
      storage: createJSONStorage(() => localStorage),

      // Persist rememberMe always, and only persist user if rememberMe is true
      partialize: (state) => ({
        rememberMe: state.rememberMe,
        user: state.rememberMe ? state.user : null,
      }),

      // Mark store as hydrated so router guards don't flash-redirect
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);