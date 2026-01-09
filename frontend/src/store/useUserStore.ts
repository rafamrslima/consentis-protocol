import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole, ProfileStatus } from "@/types";

interface UserState {
  walletAddress: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  researcherProfileId: string | null;
  profileStatus: ProfileStatus;
  _hasHydrated: boolean;
}

interface UserActions {
  setWalletAddress: (address: string | null) => void;
  setRole: (role: UserRole) => void;
  clearUser: () => void;
  setUser: (address: string, role: UserRole) => void;
  setHasHydrated: (state: boolean) => void;
  setResearcherProfile: (profileId: string) => void;
  setProfileStatus: (status: ProfileStatus) => void;
}

type UserStore = UserState & UserActions;

const initialState: Omit<UserState, "_hasHydrated"> = {
  walletAddress: null,
  role: null,
  isAuthenticated: false,
  researcherProfileId: null,
  profileStatus: "unknown",
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

      setResearcherProfile: (profileId) =>
        set({
          researcherProfileId: profileId || null,
          profileStatus: profileId ? "complete" : "incomplete",
        }),

      setProfileStatus: (status) => set({ profileStatus: status }),
    }),
    {
      name: "consentis-user-storage",
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        researcherProfileId: state.researcherProfileId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
