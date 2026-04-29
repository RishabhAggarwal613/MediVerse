"use client";

import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import type { AuthResponsePayload, UserDto } from "@/types/api";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  /** ISO user id — backend JWT subject */
  user: UserDto | null;
}

interface AuthActions {
  setSession: (payload: AuthResponsePayload) => void;
  /** OAuth redirect lacks user — tokens only; call {@link fetchCurrentUser} next. */
  setOAuthTokens: (args: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
  }) => void;
  setUser: (user: UserDto) => void;
  clearSession: () => void;
}

const empty: AuthState = {
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
  user: null,
};

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...empty,

      setSession: (payload) =>
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          accessTokenExpiresAt: payload.accessTokenExpiresAt,
          user: payload.user,
        }),

      setOAuthTokens: ({
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
      }) =>
        set({
          ...empty,
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
        }),

      setUser: (user) =>
        set((s) => ({ ...s, user })),

      clearSession: () => set(empty),
    }),
    {
      name: "mediverse-auth",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        user: state.user,
      }),
    },
  ),
);
