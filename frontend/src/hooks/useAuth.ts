"use client";

import { useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useUserStore } from "@/store/useUserStore";
import type { UserRole } from "@/types";

export function useAuth() {
  const { address, isConnected, status } = useAccount();
  const { disconnect } = useDisconnect();

  const {
    walletAddress,
    role,
    isAuthenticated,
    _hasHydrated,
    profileStatus,
    setWalletAddress,
    setRole,
    setUser,
    clearUser,
    setProfileStatus,
  } = useUserStore();

  const isWagmiLoading = status === "connecting" || status === "reconnecting";

  useEffect(() => {
    if (!_hasHydrated || isWagmiLoading) return;

    if (isConnected && address) {
      if (walletAddress !== address) {
        setWalletAddress(address);
      }
    } else if (status === "disconnected") {
      if (walletAddress !== null) {
        clearUser();
      }
    }
  }, [
    isConnected,
    address,
    status,
    walletAddress,
    _hasHydrated,
    isWagmiLoading,
    setWalletAddress,
    clearUser,
  ]);

  const selectRole = (selectedRole: UserRole) => {
    if (address) {
      setUser(address, selectedRole);
      if (selectedRole === "researcher") {
        setProfileStatus("unknown");
      }
    } else {
      setRole(selectedRole);
    }
  };

  const logout = () => {
    disconnect();
    clearUser();
  };

  const isLoading = !_hasHydrated || isWagmiLoading;
  const needsRoleSelection = !isLoading && isConnected && address && !role;
  const isFullyAuthenticated =
    !isLoading && isConnected && address && role && isAuthenticated;
  const needsResearcherProfile =
    !isLoading &&
    isConnected &&
    role === "researcher" &&
    (profileStatus === "unknown" || profileStatus === "incomplete");

  return {
    address,
    isConnected,
    isLoading,
    status,

    role,
    isAuthenticated: isFullyAuthenticated,
    needsRoleSelection,
    needsResearcherProfile,
    profileStatus,

    selectRole,
    logout,
  };
}
