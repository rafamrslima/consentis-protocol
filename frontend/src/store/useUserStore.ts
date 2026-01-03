import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/types";

interface UserState {
  walletAddress: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
}

interface UserActions {
  setWalletAddress: (address: string | null) => void;
  setRole: (role: UserRole) => void;
  clearUser: () => void;
  setUser: (address: string, role: UserRole) => void;
  setHasHydrated: (state: boolean) => void;
}

type UserStore = UserState & UserActions;

const initialState: Omit<UserState, "_hasHydrated"> = {
  walletAddress: null,
  role: null,
  isAuthenticated: false,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,
      _hasHydrated: false,

      setWalletAddress: (address) =>
        set((state) => ({
          walletAddress: address,
          isAuthenticated: address !== null && state.role !== null,
        })),

      setRole: (role) =>
        set((state) => ({
          role,
          isAuthenticated: state.walletAddress !== null,
        })),

      setUser: (address, role) =>
        set({
          walletAddress: address,
          role,
          isAuthenticated: true,
        }),

      clearUser: () => set(initialState),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "consentis-user-storage",
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
