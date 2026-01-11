import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConsentRegistry, useCheckConsent } from "../useConsentRegistry";

const mockWriteContract = vi.fn();
const mockReset = vi.fn();

vi.mock("wagmi", () => ({
  useWriteContract: vi.fn(() => ({
    writeContract: mockWriteContract,
    data: undefined,
    isPending: false,
    isSuccess: false,
    error: null,
    reset: mockReset,
  })),
  useReadContract: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    refetch: vi.fn(),
  })),
}));

vi.mock("@/contracts/consentRegistry", () => ({
  CONSENT_REGISTRY_ADDRESS: "0xContractAddress" as `0x${string}`,
  CONSENT_REGISTRY_ABI: [],
}));

import { useWriteContract, useReadContract } from "wagmi";

describe("useConsentRegistry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("returns grantConsent function", () => {
      const { result } = renderHook(() => useConsentRegistry());
      expect(typeof result.current.grantConsent).toBe("function");
    });

    it("returns revokeConsent function", () => {
      const { result } = renderHook(() => useConsentRegistry());
      expect(typeof result.current.revokeConsent).toBe("function");
    });

    it("returns isPending as false initially", () => {
      const { result } = renderHook(() => useConsentRegistry());
      expect(result.current.isPending).toBe(false);
    });

    it("returns isConfirmed as false initially", () => {
      const { result } = renderHook(() => useConsentRegistry());
      expect(result.current.isConfirmed).toBe(false);
    });

    it("returns error as null initially", () => {
      const { result } = renderHook(() => useConsentRegistry());
      expect(result.current.error).toBeNull();
    });

    it("returns hash as undefined initially", () => {
      const { result } = renderHook(() => useConsentRegistry());
      expect(result.current.hash).toBeUndefined();
    });

    it("returns reset function", () => {
      const { result } = renderHook(() => useConsentRegistry());
      expect(typeof result.current.reset).toBe("function");
    });
  });

  describe("grantConsent", () => {
    it("calls writeContract with correct parameters", () => {
      const { result } = renderHook(() => useConsentRegistry());

      act(() => {
        result.current.grantConsent(
          "0x1234567890123456789012345678901234567890",
          "record-123"
        );
      });

      expect(mockWriteContract).toHaveBeenCalledWith({
        address: "0xContractAddress",
        abi: [],
        functionName: "grantConsent",
        args: ["0x1234567890123456789012345678901234567890", "record-123"],
      });
    });
  });

  describe("revokeConsent", () => {
    it("calls writeContract with correct parameters", () => {
      const { result } = renderHook(() => useConsentRegistry());

      act(() => {
        result.current.revokeConsent(
          "0x1234567890123456789012345678901234567890",
          "record-123"
        );
      });

      expect(mockWriteContract).toHaveBeenCalledWith({
        address: "0xContractAddress",
        abi: [],
        functionName: "revokeConsent",
        args: ["0x1234567890123456789012345678901234567890", "record-123"],
      });
    });
  });

  describe("isPending state", () => {
    it("returns true when transaction is pending", () => {
      vi.mocked(useWriteContract).mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: true,
        isSuccess: false,
        error: null,
        reset: mockReset,
      } as unknown as ReturnType<typeof useWriteContract>);

      const { result } = renderHook(() => useConsentRegistry());
      expect(result.current.isPending).toBe(true);
    });
  });

  describe("isConfirmed state", () => {
    it("returns true when transaction is confirmed", () => {
      vi.mocked(useWriteContract).mockReturnValue({
        writeContract: mockWriteContract,
        data: "0xhash",
        isPending: false,
        isSuccess: true,
        error: null,
        reset: mockReset,
      } as unknown as ReturnType<typeof useWriteContract>);

      const { result } = renderHook(() => useConsentRegistry());
      expect(result.current.isConfirmed).toBe(true);
    });
  });

  describe("error state", () => {
    it("returns error when transaction fails", () => {
      const mockError = new Error("Transaction failed");
      vi.mocked(useWriteContract).mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        isSuccess: false,
        error: mockError,
        reset: mockReset,
      } as unknown as ReturnType<typeof useWriteContract>);

      const { result } = renderHook(() => useConsentRegistry());
      expect(result.current.error).toBe(mockError);
    });
  });

  describe("reset", () => {
    it("calls the reset function from useWriteContract", () => {
      const { result } = renderHook(() => useConsentRegistry());

      act(() => {
        result.current.reset();
      });

      expect(mockReset).toHaveBeenCalled();
    });
  });
});

describe("useCheckConsent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when all parameters are provided", () => {
    it("returns hasConsent value", () => {
      vi.mocked(useReadContract).mockReturnValue({
        data: true,
        isLoading: false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadContract>);

      const { result } = renderHook(() =>
        useCheckConsent("0xPatient", "0xResearcher", "record-123")
      );

      expect(result.current.hasConsent).toBe(true);
    });

    it("returns isLoading state", () => {
      vi.mocked(useReadContract).mockReturnValue({
        data: undefined,
        isLoading: true,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadContract>);

      const { result } = renderHook(() =>
        useCheckConsent("0xPatient", "0xResearcher", "record-123")
      );

      expect(result.current.isLoading).toBe(true);
    });

    it("returns refetch function", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useReadContract).mockReturnValue({
        data: undefined,
        isLoading: false,
        refetch: mockRefetch,
      } as unknown as ReturnType<typeof useReadContract>);

      const { result } = renderHook(() =>
        useCheckConsent("0xPatient", "0xResearcher", "record-123")
      );

      expect(result.current.refetch).toBe(mockRefetch);
    });
  });

  describe("when parameters are missing", () => {
    it("returns undefined hasConsent when patientAddress is undefined", () => {
      vi.mocked(useReadContract).mockReturnValue({
        data: undefined,
        isLoading: false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadContract>);

      const { result } = renderHook(() =>
        useCheckConsent(undefined, "0xResearcher", "record-123")
      );

      expect(result.current.hasConsent).toBeUndefined();
    });

    it("returns undefined hasConsent when researcherAddress is undefined", () => {
      vi.mocked(useReadContract).mockReturnValue({
        data: undefined,
        isLoading: false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadContract>);

      const { result } = renderHook(() =>
        useCheckConsent("0xPatient", undefined, "record-123")
      );

      expect(result.current.hasConsent).toBeUndefined();
    });

    it("returns undefined hasConsent when recordId is undefined", () => {
      vi.mocked(useReadContract).mockReturnValue({
        data: undefined,
        isLoading: false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useReadContract>);

      const { result } = renderHook(() =>
        useCheckConsent("0xPatient", "0xResearcher", undefined)
      );

      expect(result.current.hasConsent).toBeUndefined();
    });
  });
});
