import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useResearcherProfile,
  RESEARCHER_PROFILE_KEY,
} from "../useResearcherProfile";
import type { ReactNode } from "react";

const mockSetResearcherProfile = vi.fn();
const mockSetProfileStatus = vi.fn();

vi.mock("@/store/useUserStore", () => ({
  useUserStore: vi.fn(() => ({
    researcherProfileId: "",
    profileStatus: "unknown",
    setResearcherProfile: mockSetResearcherProfile,
    setProfileStatus: mockSetProfileStatus,
  })),
}));

const mockGetResearcherProfileByAddress = vi.fn();
const mockCreateResearcherProfile = vi.fn();

vi.mock("@/services/api", () => ({
  getResearcherProfileByAddress: (...args: unknown[]) =>
    mockGetResearcherProfileByAddress(...args),
  createResearcherProfile: (...args: unknown[]) =>
    mockCreateResearcherProfile(...args),
}));

import { useUserStore } from "@/store/useUserStore";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useResearcherProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetResearcherProfileByAddress.mockResolvedValue(null);
    vi.mocked(useUserStore).mockReturnValue({
      researcherProfileId: "",
      profileStatus: "unknown",
      setResearcherProfile: mockSetResearcherProfile,
      setProfileStatus: mockSetProfileStatus,
    });
  });

  describe("initial state", () => {
    it("returns profileId from store", () => {
      vi.mocked(useUserStore).mockReturnValue({
        researcherProfileId: "profile-123",
        profileStatus: "complete",
        setResearcherProfile: mockSetResearcherProfile,
        setProfileStatus: mockSetProfileStatus,
      });

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      expect(result.current.profileId).toBe("profile-123");
    });

    it("returns profileStatus from store", () => {
      vi.mocked(useUserStore).mockReturnValue({
        researcherProfileId: "",
        profileStatus: "checking",
        setResearcherProfile: mockSetResearcherProfile,
        setProfileStatus: mockSetProfileStatus,
      });

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      expect(result.current.profileStatus).toBe("checking");
    });

    it("returns checkProfile function", () => {
      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      expect(typeof result.current.checkProfile).toBe("function");
    });

    it("returns createProfile function", () => {
      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      expect(typeof result.current.createProfile).toBe("function");
    });
  });

  describe("hasProfile / needsProfile computed values", () => {
    it("hasProfile is true when profileStatus is complete", () => {
      vi.mocked(useUserStore).mockReturnValue({
        researcherProfileId: "profile-123",
        profileStatus: "complete",
        setResearcherProfile: mockSetResearcherProfile,
        setProfileStatus: mockSetProfileStatus,
      });

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      expect(result.current.hasProfile).toBe(true);
      expect(result.current.needsProfile).toBe(false);
    });

    it("needsProfile is true when profileStatus is incomplete", () => {
      vi.mocked(useUserStore).mockReturnValue({
        researcherProfileId: "",
        profileStatus: "incomplete",
        setResearcherProfile: mockSetResearcherProfile,
        setProfileStatus: mockSetProfileStatus,
      });

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      expect(result.current.hasProfile).toBe(false);
      expect(result.current.needsProfile).toBe(true);
    });

    it("both are false when profileStatus is unknown", () => {
      vi.mocked(useUserStore).mockReturnValue({
        researcherProfileId: "",
        profileStatus: "unknown",
        setResearcherProfile: mockSetResearcherProfile,
        setProfileStatus: mockSetProfileStatus,
      });

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      expect(result.current.hasProfile).toBe(false);
      expect(result.current.needsProfile).toBe(false);
    });
  });

  describe("checkQuery - auto fetch when enabled", () => {
    it("fetches profile when address provided and status is unknown", async () => {
      mockGetResearcherProfileByAddress.mockResolvedValue({
        id: "profile-123",
        name: "Dr. Test",
        institution: "Test University",
      });

      renderHook(() => useResearcherProfile("0xResearcher"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSetProfileStatus).toHaveBeenCalledWith("checking");
      });
    });

    it("does not fetch when address is undefined", async () => {
      renderHook(() => useResearcherProfile(undefined), {
        wrapper: createWrapper(),
      });

      await new Promise((r) => setTimeout(r, 50));

      expect(mockGetResearcherProfileByAddress).not.toHaveBeenCalled();
    });

    it("does not trigger check when profileStatus is not unknown", async () => {
      vi.mocked(useUserStore).mockReturnValue({
        researcherProfileId: "profile-123",
        profileStatus: "complete",
        setResearcherProfile: mockSetResearcherProfile,
        setProfileStatus: mockSetProfileStatus,
      });

      renderHook(() => useResearcherProfile("0xResearcher"), {
        wrapper: createWrapper(),
      });

      await new Promise((r) => setTimeout(r, 50));

      expect(mockSetProfileStatus).not.toHaveBeenCalledWith("checking");
    });

    it("calls setResearcherProfile with profile id on success", async () => {
      mockGetResearcherProfileByAddress.mockResolvedValue({
        id: "profile-456",
        name: "Dr. Test",
      });

      renderHook(() => useResearcherProfile("0xResearcher"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSetResearcherProfile).toHaveBeenCalledWith("profile-456");
      });
    });

    it("calls setResearcherProfile with empty string when profile not found", async () => {
      mockGetResearcherProfileByAddress.mockResolvedValue(null);

      renderHook(() => useResearcherProfile("0xResearcher"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSetResearcherProfile).toHaveBeenCalledWith("");
      });
    });
  });

  describe("createProfile mutation", () => {
    it("calls createResearcherProfile API", async () => {
      vi.mocked(useUserStore).mockReturnValue({
        researcherProfileId: "",
        profileStatus: "incomplete",
        setResearcherProfile: mockSetResearcherProfile,
        setProfileStatus: mockSetProfileStatus,
      });
      mockCreateResearcherProfile.mockResolvedValue("new-profile-id");

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      const profileData = {
        wallet_address: "0xResearcher",
        full_name: "Dr. New Researcher",
        institution: "New University",
        professional_email: "dr@university.edu",
      };

      await act(async () => {
        await result.current.createProfile(profileData);
      });

      expect(mockCreateResearcherProfile.mock.calls[0][0]).toEqual(profileData);
    });

    it("calls setResearcherProfile on successful creation", async () => {
      mockCreateResearcherProfile.mockResolvedValue("created-profile-id");

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      await act(async () => {
        await result.current.createProfile({
          wallet_address: "0xResearcher",
          full_name: "Dr. Test",
          institution: "University",
          professional_email: "test@university.edu",
        });
      });

      expect(mockSetResearcherProfile).toHaveBeenCalledWith(
        "created-profile-id"
      );
    });

    it("isCreating reflects mutation state", async () => {
      mockCreateResearcherProfile.mockResolvedValue("profile-id");

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      expect(result.current.isCreating).toBe(false);

      await act(async () => {
        await result.current.createProfile({
          wallet_address: "0xResearcher",
          full_name: "Dr. Test",
          institution: "University",
          professional_email: "test@university.edu",
        });
      });

      expect(result.current.isCreating).toBe(false);
    });

    it("createError contains error on failure", async () => {
      const testError = new Error("Creation failed");
      mockCreateResearcherProfile.mockRejectedValue(testError);

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      await act(async () => {
        try {
          await result.current.createProfile({
            wallet_address: "0xResearcher",
            full_name: "Dr. Test",
            institution: "University",
            professional_email: "test@university.edu",
          });
        } catch {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(result.current.createError).not.toBeNull();
      });
    });
  });

  describe("isChecking state", () => {
    it("isChecking is true when checkQuery is loading", async () => {
      let resolveCheck: (value: unknown) => void;
      mockGetResearcherProfileByAddress.mockImplementation(
        () => new Promise((resolve) => (resolveCheck = resolve))
      );

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isChecking).toBe(true);
      });

      await act(async () => {
        resolveCheck!({ id: "profile-123" });
      });
    });

    it("isChecking is true when profileStatus is checking", () => {
      vi.mocked(useUserStore).mockReturnValue({
        researcherProfileId: "",
        profileStatus: "checking",
        setResearcherProfile: mockSetResearcherProfile,
        setProfileStatus: mockSetProfileStatus,
      });

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      expect(result.current.isChecking).toBe(true);
    });
  });

  describe("profile data", () => {
    it("returns profile data from checkQuery", async () => {
      const mockProfile = {
        id: "profile-123",
        name: "Dr. Test",
        institution: "Test University",
        research_area: "Data Science",
      };
      mockGetResearcherProfileByAddress.mockResolvedValue(mockProfile);

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });
    });

    it("returns null when no profile exists", async () => {
      mockGetResearcherProfileByAddress.mockResolvedValue(null);

      const { result } = renderHook(
        () => useResearcherProfile("0xResearcher"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(mockSetResearcherProfile).toHaveBeenCalled();
      });

      expect(result.current.profile).toBeNull();
    });
  });

  describe("RESEARCHER_PROFILE_KEY constant", () => {
    it("exports the correct query key", () => {
      expect(RESEARCHER_PROFILE_KEY).toBe("researcherProfile");
    });
  });
});
