import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { usePatientRecords, PATIENT_RECORDS_KEY } from "../usePatientRecords";
import type { PatientRecord } from "@/types";
import * as api from "@/services/api";

vi.mock("@/services/api", () => ({
  getPatientRecords: vi.fn(),
}));

const mockPatientRecord: PatientRecord = {
  id: "record-1",
  name: "Blood Work - Dec 2025",
  ipfs_cid: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  data_to_encrypt_hash: "a1b2c3d4e5f6",
  patient_address: "0x1234567890123456789012345678901234567890",
  acc_json: [
    {
      contractAddress: "0xContract",
      chain: "sepolia",
      method: "hasConsent",
      parameters: [":userAddress", "record-1"],
      returnValueTest: { comparator: "=", value: "true" },
    },
  ],
  created_at: "2025-12-15T10:30:00Z",
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("usePatientRecords", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("when address is undefined", () => {
    it("returns empty records array", () => {
      const { result } = renderHook(() => usePatientRecords(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.records).toEqual([]);
    });

    it("does not call getPatientRecords", () => {
      renderHook(() => usePatientRecords(undefined), {
        wrapper: createWrapper(),
      });

      expect(api.getPatientRecords).not.toHaveBeenCalled();
    });

    it("is not loading", () => {
      const { result } = renderHook(() => usePatientRecords(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("when address is provided", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";

    it("fetches records for the address", async () => {
      vi.mocked(api.getPatientRecords).mockResolvedValue([mockPatientRecord]);

      const { result } = renderHook(() => usePatientRecords(mockAddress), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(api.getPatientRecords).toHaveBeenCalledWith(mockAddress);
    });

    it("returns records when fetch succeeds", async () => {
      vi.mocked(api.getPatientRecords).mockResolvedValue([mockPatientRecord]);

      const { result } = renderHook(() => usePatientRecords(mockAddress), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.records).toHaveLength(1);
      });

      expect(result.current.records[0].name).toBe("Blood Work - Dec 2025");
    });

    it("returns empty array when no records", async () => {
      vi.mocked(api.getPatientRecords).mockResolvedValue([]);

      const { result } = renderHook(() => usePatientRecords(mockAddress), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.records).toEqual([]);
    });

    it("shows loading state while fetching", () => {
      vi.mocked(api.getPatientRecords).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => usePatientRecords(mockAddress), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("sets error state on failure", async () => {
      const error = new Error("Network error");
      vi.mocked(api.getPatientRecords).mockRejectedValue(error);

      const { result } = renderHook(() => usePatientRecords(mockAddress), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe("invalidateRecords", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";

    it("is a function", async () => {
      vi.mocked(api.getPatientRecords).mockResolvedValue([]);

      const { result } = renderHook(() => usePatientRecords(mockAddress), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.invalidateRecords).toBe("function");
    });

    it("triggers a refetch when called", async () => {
      vi.mocked(api.getPatientRecords).mockResolvedValue([mockPatientRecord]);

      const { result } = renderHook(() => usePatientRecords(mockAddress), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(api.getPatientRecords).toHaveBeenCalledTimes(1);

      result.current.invalidateRecords();

      await waitFor(() => {
        expect(api.getPatientRecords).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("PATIENT_RECORDS_KEY", () => {
    it("is exported as a constant", () => {
      expect(PATIENT_RECORDS_KEY).toBe("patientRecords");
    });
  });
});
