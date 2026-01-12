import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../useAuth";
import { useUserStore } from "@/store/useUserStore";
import type { UseAccountReturnType } from "wagmi";

const mockDisconnect = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: vi.fn(() => ({
    address: undefined,
    isConnected: false,
    status: "disconnected",
  })),
  useDisconnect: vi.fn(() => ({
    disconnect: mockDisconnect,
  })),
}));

import { useAccount } from "wagmi";

const mockAddress = "0x1234567890123456789012345678901234567890" as const;

function mockDisconnectedAccount(): UseAccountReturnType {
  return {
    address: undefined,
    isConnected: false,
    status: "disconnected",
    addresses: undefined,
    chain: undefined,
    chainId: undefined,
    connector: undefined,
    isConnecting: false,
    isDisconnected: true,
    isReconnecting: false,
  } as UseAccountReturnType;
}

function mockConnectedAccount(
  address: `0x${string}` = mockAddress
): UseAccountReturnType {
  return {
    address,
    isConnected: true,
    status: "connected",
    addresses: [address],
    chain: undefined,
    chainId: 11155111,
    connector: {} as UseAccountReturnType["connector"],
    isConnecting: false,
    isDisconnected: false,
    isReconnecting: false,
  } as UseAccountReturnType;
}

function mockConnectingAccount(): UseAccountReturnType {
  return {
    address: undefined,
    isConnected: false,
    status: "connecting",
    addresses: undefined,
    chain: undefined,
    chainId: undefined,
    connector: undefined,
    isConnecting: true,
    isDisconnected: false,
    isReconnecting: false,
  } as UseAccountReturnType;
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.getState().clearUser();
    useUserStore.setState({ _hasHydrated: true });
  });

  describe("when wallet is disconnected", () => {
    beforeEach(() => {
      vi.mocked(useAccount).mockReturnValue(mockDisconnectedAccount());
    });

    it("returns isConnected as false", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isConnected).toBe(false);
    });

    it("returns address as undefined", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.address).toBeUndefined();
    });

    it("returns isAuthenticated as false", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("returns needsRoleSelection as false", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.needsRoleSelection).toBe(false);
    });
  });

  describe("when wallet is connected without role", () => {
    beforeEach(() => {
      vi.mocked(useAccount).mockReturnValue(mockConnectedAccount());
    });

    it("returns isConnected as true", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isConnected).toBe(true);
    });

    it("returns the wallet address", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.address).toBe(mockAddress);
    });

    it("returns needsRoleSelection as true when no role set", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.needsRoleSelection).toBe(true);
    });

    it("returns isAuthenticated as falsy without role", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isAuthenticated).toBeFalsy();
    });
  });

  describe("when wallet is connected with role", () => {
    beforeEach(() => {
      vi.mocked(useAccount).mockReturnValue(mockConnectedAccount());
      useUserStore.getState().setUser(mockAddress, "patient");
    });

    it("returns isAuthenticated as true", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("returns needsRoleSelection as false", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.needsRoleSelection).toBe(false);
    });

    it("returns the correct role", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.role).toBe("patient");
    });
  });

  describe("selectRole", () => {
    beforeEach(() => {
      vi.mocked(useAccount).mockReturnValue(mockConnectedAccount());
    });

    it("sets patient role correctly", () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.selectRole("patient");
      });

      expect(result.current.role).toBe("patient");
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("sets researcher role correctly", () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.selectRole("researcher");
      });

      expect(result.current.role).toBe("researcher");
    });

    it("sets profileStatus to unknown for researcher", () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.selectRole("researcher");
      });

      expect(result.current.profileStatus).toBe("unknown");
    });
  });

  describe("logout", () => {
    beforeEach(() => {
      vi.mocked(useAccount).mockReturnValue(mockConnectedAccount());
      useUserStore.getState().setUser(mockAddress, "patient");
    });

    it("calls disconnect", () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("clears role from store", () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      expect(useUserStore.getState().role).toBeNull();
      expect(useUserStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("needsResearcherProfile", () => {
    beforeEach(() => {
      vi.mocked(useAccount).mockReturnValue(mockConnectedAccount());
    });

    it("returns true for researcher with unknown profile status", () => {
      useUserStore.getState().setUser(mockAddress, "researcher");
      useUserStore.getState().setProfileStatus("unknown");

      const { result } = renderHook(() => useAuth());
      expect(result.current.needsResearcherProfile).toBe(true);
    });

    it("returns true for researcher with incomplete profile", () => {
      useUserStore.getState().setUser(mockAddress, "researcher");
      useUserStore.getState().setProfileStatus("incomplete");

      const { result } = renderHook(() => useAuth());
      expect(result.current.needsResearcherProfile).toBe(true);
    });

    it("returns false for researcher with complete profile", () => {
      useUserStore.getState().setUser(mockAddress, "researcher");
      useUserStore.getState().setProfileStatus("complete");

      const { result } = renderHook(() => useAuth());
      expect(result.current.needsResearcherProfile).toBe(false);
    });

    it("returns false for patient", () => {
      useUserStore.getState().setUser(mockAddress, "patient");

      const { result } = renderHook(() => useAuth());
      expect(result.current.needsResearcherProfile).toBe(false);
    });
  });

  describe("isLoading", () => {
    it("returns true when not hydrated", () => {
      useUserStore.setState({ _hasHydrated: false });
      vi.mocked(useAccount).mockReturnValue(mockDisconnectedAccount());

      const { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(true);
    });

    it("returns true when wagmi is connecting", () => {
      vi.mocked(useAccount).mockReturnValue(mockConnectingAccount());

      const { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(true);
    });

    it("returns false when hydrated and not connecting", () => {
      vi.mocked(useAccount).mockReturnValue(mockDisconnectedAccount());

      const { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(false);
    });
  });
});
