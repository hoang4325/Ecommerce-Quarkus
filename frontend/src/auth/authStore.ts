import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserInfoDTO } from '../types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfoDTO | null;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: UserInfoDTO) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      isAuthenticated: () => !!get().accessToken,
      isAdmin: () => get().user?.roles?.includes('ADMIN') ?? false,
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

// Keep backward compatibility export
export const authStore = {
  setTokens: (access: string, refresh: string) => useAuthStore.getState().setTokens(access, refresh),
  setUser: (user: UserInfoDTO) => useAuthStore.getState().setUser(user),
  logout: () => useAuthStore.getState().logout(),
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
};