import { describe, it, expect, beforeEach } from "vitest";
import { useUserStore } from "../useUserStore";

describe("useUserStore", () => {
  beforeEach(() => {
    useUserStore.getState().clearUser();
    useUserStore.setState({ _hasHydrated: true });
  });

  describe("initial state", () => {
    it("has null wallet address", () => {
      expect(useUserStore.getState().walletAddress).toBeNull();
    });

    it("has null role", () => {
      expect(useUserStore.getState().role).toBeNull();
    });

    it("is not authenticated", () => {
      expect(useUserStore.getState().isAuthenticated).toBe(false);
    });

    it("has null researcher profile id", () => {
      expect(useUserStore.getState().researcherProfileId).toBeNull();
    });

    it("has unknown profile status", () => {
      expect(useUserStore.getState().profileStatus).toBe("unknown");
    });
  });

  describe("setWalletAddress", () => {
    it("sets wallet address", () => {
      useUserStore.getState().setWalletAddress("0x123");
      expect(useUserStore.getState().walletAddress).toBe("0x123");
    });

    it("does not authenticate without role", () => {
      useUserStore.getState().setWalletAddress("0x123");
      expect(useUserStore.getState().isAuthenticated).toBe(false);
    });

    it("authenticates when role is already set", () => {
      useUserStore.getState().setRole("patient");
      useUserStore.getState().setWalletAddress("0x123");
      expect(useUserStore.getState().isAuthenticated).toBe(true);
    });

    it("sets address to null", () => {
      useUserStore.getState().setWalletAddress("0x123");
      useUserStore.getState().setWalletAddress(null);
      expect(useUserStore.getState().walletAddress).toBeNull();
    });
  });

  describe("setRole", () => {
    it("sets role to patient", () => {
      useUserStore.getState().setRole("patient");
      expect(useUserStore.getState().role).toBe("patient");
    });

    it("sets role to researcher", () => {
      useUserStore.getState().setRole("researcher");
      expect(useUserStore.getState().role).toBe("researcher");
    });

    it("authenticates when wallet address is already set", () => {
      useUserStore.getState().setWalletAddress("0x123");
      useUserStore.getState().setRole("patient");
      expect(useUserStore.getState().isAuthenticated).toBe(true);
    });

    it("does not authenticate without wallet address", () => {
      useUserStore.getState().setRole("patient");
      expect(useUserStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("setUser", () => {
    it("sets wallet address and role together", () => {
      useUserStore.getState().setUser("0x123", "patient");
      expect(useUserStore.getState().walletAddress).toBe("0x123");
      expect(useUserStore.getState().role).toBe("patient");
    });

    it("authenticates immediately", () => {
      useUserStore.getState().setUser("0x123", "researcher");
      expect(useUserStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe("clearUser", () => {
    it("resets wallet address to null", () => {
      useUserStore.getState().setUser("0x123", "patient");
      useUserStore.getState().clearUser();
      expect(useUserStore.getState().walletAddress).toBeNull();
    });

    it("resets role to null", () => {
      useUserStore.getState().setUser("0x123", "patient");
      useUserStore.getState().clearUser();
      expect(useUserStore.getState().role).toBeNull();
    });

    it("sets authenticated to false", () => {
      useUserStore.getState().setUser("0x123", "patient");
      useUserStore.getState().clearUser();
      expect(useUserStore.getState().isAuthenticated).toBe(false);
    });

    it("resets researcher profile id to null", () => {
      useUserStore.getState().setResearcherProfile("profile-123");
      useUserStore.getState().clearUser();
      expect(useUserStore.getState().researcherProfileId).toBeNull();
    });

    it("resets profile status to unknown", () => {
      useUserStore.getState().setProfileStatus("complete");
      useUserStore.getState().clearUser();
      expect(useUserStore.getState().profileStatus).toBe("unknown");
    });
  });

  describe("setResearcherProfile", () => {
    it("sets researcher profile id", () => {
      useUserStore.getState().setResearcherProfile("profile-123");
      expect(useUserStore.getState().researcherProfileId).toBe("profile-123");
    });

    it("sets profile status to complete when id provided", () => {
      useUserStore.getState().setResearcherProfile("profile-123");
      expect(useUserStore.getState().profileStatus).toBe("complete");
    });

    it("sets profile status to incomplete when empty string", () => {
      useUserStore.getState().setResearcherProfile("");
      expect(useUserStore.getState().profileStatus).toBe("incomplete");
    });
  });

  describe("setProfileStatus", () => {
    it("sets profile status to checking", () => {
      useUserStore.getState().setProfileStatus("checking");
      expect(useUserStore.getState().profileStatus).toBe("checking");
    });

    it("sets profile status to complete", () => {
      useUserStore.getState().setProfileStatus("complete");
      expect(useUserStore.getState().profileStatus).toBe("complete");
    });

    it("sets profile status to incomplete", () => {
      useUserStore.getState().setProfileStatus("incomplete");
      expect(useUserStore.getState().profileStatus).toBe("incomplete");
    });

    it("sets profile status to unknown", () => {
      useUserStore.getState().setProfileStatus("complete");
      useUserStore.getState().setProfileStatus("unknown");
      expect(useUserStore.getState().profileStatus).toBe("unknown");
    });
  });

  describe("setHasHydrated", () => {
    it("sets hydrated state to true", () => {
      useUserStore.getState().setHasHydrated(true);
      expect(useUserStore.getState()._hasHydrated).toBe(true);
    });

    it("sets hydrated state to false", () => {
      useUserStore.getState().setHasHydrated(false);
      expect(useUserStore.getState()._hasHydrated).toBe(false);
    });
  });
});
