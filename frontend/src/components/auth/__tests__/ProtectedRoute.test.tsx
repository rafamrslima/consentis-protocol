import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ProtectedRoute } from "../ProtectedRoute";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockUseAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseResearcherProfile = vi.fn();
vi.mock("@/hooks/useResearcherProfile", () => ({
  useResearcherProfile: () => mockUseResearcherProfile(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseResearcherProfile.mockReturnValue({
      isChecking: false,
      needsProfile: false,
    });
  });

  describe("loading state", () => {
    it("shows loader when auth is loading", () => {
      mockUseAuth.mockReturnValue({
        address: undefined,
        isConnected: false,
        isLoading: true,
        isAuthenticated: false,
        role: null,
        needsRoleSelection: false,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("shows loader when researcher profile is checking", () => {
      mockUseAuth.mockReturnValue({
        address: "0xResearcher",
        isConnected: true,
        isLoading: false,
        isAuthenticated: true,
        role: "researcher",
        needsRoleSelection: false,
      });
      mockUseResearcherProfile.mockReturnValue({
        isChecking: true,
        needsProfile: false,
      });

      render(
        <ProtectedRoute allowedRoles={["researcher"]}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  describe("redirect behavior", () => {
    it("redirects to /connect when not connected", async () => {
      mockUseAuth.mockReturnValue({
        address: undefined,
        isConnected: false,
        isLoading: false,
        isAuthenticated: false,
        role: null,
        needsRoleSelection: false,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/connect");
      });
    });

    it("redirects to /connect when needs role selection", async () => {
      mockUseAuth.mockReturnValue({
        address: "0xUser",
        isConnected: true,
        isLoading: false,
        isAuthenticated: false,
        role: null,
        needsRoleSelection: true,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/connect");
      });
    });

    it("redirects researcher to /researcher-profile when profile needed", async () => {
      mockUseAuth.mockReturnValue({
        address: "0xResearcher",
        isConnected: true,
        isLoading: false,
        isAuthenticated: true,
        role: "researcher",
        needsRoleSelection: false,
      });
      mockUseResearcherProfile.mockReturnValue({
        isChecking: false,
        needsProfile: true,
      });

      render(
        <ProtectedRoute allowedRoles={["researcher"]}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/researcher-profile");
      });
    });

    it("redirects patient to /records when accessing researcher-only route", async () => {
      mockUseAuth.mockReturnValue({
        address: "0xPatient",
        isConnected: true,
        isLoading: false,
        isAuthenticated: true,
        role: "patient",
        needsRoleSelection: false,
      });

      render(
        <ProtectedRoute allowedRoles={["researcher"]}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/records");
      });
    });

    it("redirects researcher to /shared when accessing patient-only route", async () => {
      mockUseAuth.mockReturnValue({
        address: "0xResearcher",
        isConnected: true,
        isLoading: false,
        isAuthenticated: true,
        role: "researcher",
        needsRoleSelection: false,
      });

      render(
        <ProtectedRoute allowedRoles={["patient"]}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/shared");
      });
    });
  });

  describe("rendering children", () => {
    it("renders children when patient is authenticated", () => {
      mockUseAuth.mockReturnValue({
        address: "0xPatient",
        isConnected: true,
        isLoading: false,
        isAuthenticated: true,
        role: "patient",
        needsRoleSelection: false,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("renders children when researcher is authenticated with profile", () => {
      mockUseAuth.mockReturnValue({
        address: "0xResearcher",
        isConnected: true,
        isLoading: false,
        isAuthenticated: true,
        role: "researcher",
        needsRoleSelection: false,
      });
      mockUseResearcherProfile.mockReturnValue({
        isChecking: false,
        needsProfile: false,
      });

      render(
        <ProtectedRoute allowedRoles={["researcher"]}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("renders children when role matches allowed roles", () => {
      mockUseAuth.mockReturnValue({
        address: "0xPatient",
        isConnected: true,
        isLoading: false,
        isAuthenticated: true,
        role: "patient",
        needsRoleSelection: false,
      });

      render(
        <ProtectedRoute allowedRoles={["patient"]}>
          <div>Patient Only Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText("Patient Only Content")).toBeInTheDocument();
    });

    it("renders children when no allowedRoles specified", () => {
      mockUseAuth.mockReturnValue({
        address: "0xUser",
        isConnected: true,
        isLoading: false,
        isAuthenticated: true,
        role: "patient",
        needsRoleSelection: false,
      });

      render(
        <ProtectedRoute>
          <div>Any Role Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText("Any Role Content")).toBeInTheDocument();
    });
  });
});
