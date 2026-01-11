import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDecrypt } from "../useDecrypt";
import type { PatientRecord, ResearcherRecord } from "@/types";

const createBlobMock = (content: string) => ({
  text: () => Promise.resolve(content),
});

const mockWalletClient = { account: { address: "0xUser" } };

vi.mock("wagmi", () => ({
  useWalletClient: vi.fn(() => ({ data: mockWalletClient })),
}));

const mockGetEncryptedFile = vi.fn();
vi.mock("@/services/api", () => ({
  getEncryptedFile: (...args: unknown[]) => mockGetEncryptedFile(...args),
}));

const mockDecryptFile = vi.fn();
const mockDecryptedDataToFile = vi.fn();
vi.mock("@/services/lit", () => ({
  decryptFile: (...args: unknown[]) => mockDecryptFile(...args),
  decryptedDataToFile: (...args: unknown[]) => mockDecryptedDataToFile(...args),
}));

import { useWalletClient } from "wagmi";

const createMockRecord = (
  overrides: Partial<PatientRecord> = {}
): PatientRecord => ({
  id: "record-123",
  name: "Test Record.pdf",
  ipfs_cid: "QmTestCid",
  data_to_encrypt_hash: "hash123",
  patient_address: "0xPatient",
  acc_json: [{ contractAddress: "0xContract" }],
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  ...overrides,
});

describe("useDecrypt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWalletClient).mockReturnValue({
      data: mockWalletClient,
    } as unknown as ReturnType<typeof useWalletClient>);
  });

  describe("initial state", () => {
    it("returns decrypt function", () => {
      const { result } = renderHook(() => useDecrypt());
      expect(typeof result.current.decrypt).toBe("function");
    });

    it("returns status as idle initially", () => {
      const { result } = renderHook(() => useDecrypt());
      expect(result.current.status).toBe("idle");
    });

    it("returns error as null initially", () => {
      const { result } = renderHook(() => useDecrypt());
      expect(result.current.error).toBeNull();
    });

    it("returns reset function", () => {
      const { result } = renderHook(() => useDecrypt());
      expect(typeof result.current.reset).toBe("function");
    });
  });

  describe("reset", () => {
    it("resets status to idle", async () => {
      mockGetEncryptedFile.mockRejectedValueOnce(new Error("Test error"));

      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord();

      await act(async () => {
        try {
          await result.current.decrypt(mockRecord);
        } catch {
          // Expected error
        }
      });

      expect(result.current.status).toBe("error");

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe("idle");
      expect(result.current.error).toBeNull();
    });
  });

  describe("decrypt - wallet not connected", () => {
    it("throws error when wallet is not connected", async () => {
      vi.mocked(useWalletClient).mockReturnValue({
        data: undefined,
      } as unknown as ReturnType<typeof useWalletClient>);

      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord();

      await expect(
        act(async () => {
          await result.current.decrypt(mockRecord);
        })
      ).rejects.toThrow("Wallet not connected");
    });
  });

  describe("decrypt - success flow", () => {
    const mockDecryptedData = new Uint8Array([1, 2, 3]);
    const mockFile = new File(["test"], "test.pdf", {
      type: "application/pdf",
    });

    beforeEach(() => {
      mockGetEncryptedFile.mockResolvedValue(createBlobMock("ciphertext"));
      mockDecryptFile.mockResolvedValue(mockDecryptedData);
      mockDecryptedDataToFile.mockReturnValue(mockFile);
    });

    it("calls getEncryptedFile with correct CID", async () => {
      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord({ ipfs_cid: "QmSpecificCid" });

      await act(async () => {
        await result.current.decrypt(mockRecord);
      });

      expect(mockGetEncryptedFile).toHaveBeenCalledWith("QmSpecificCid");
    });

    it("calls decryptFile with correct parameters", async () => {
      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord({
        data_to_encrypt_hash: "specificHash",
        acc_json: [{ contractAddress: "0xSpecificContract" }],
      });

      await act(async () => {
        await result.current.decrypt(mockRecord);
      });

      expect(mockDecryptFile).toHaveBeenCalledWith(
        "ciphertext",
        "specificHash",
        [{ contractAddress: "0xSpecificContract" }],
        mockWalletClient
      );
    });

    it("calls decryptedDataToFile with decrypted data and record name", async () => {
      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord({ name: "My Health Record.pdf" });

      await act(async () => {
        await result.current.decrypt(mockRecord);
      });

      expect(mockDecryptedDataToFile).toHaveBeenCalledWith(
        mockDecryptedData,
        "My Health Record.pdf"
      );
    });

    it("returns the decrypted file", async () => {
      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord();

      let decryptedFile: File | undefined;
      await act(async () => {
        decryptedFile = await result.current.decrypt(mockRecord);
      });

      expect(decryptedFile).toBe(mockFile);
    });

    it("ends with success status", async () => {
      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord();

      await act(async () => {
        await result.current.decrypt(mockRecord);
      });

      expect(result.current.status).toBe("success");
    });
  });

  describe("decrypt - status transitions", () => {
    it("calls getEncryptedFile during fetch phase", async () => {
      mockGetEncryptedFile.mockResolvedValue(createBlobMock("ciphertext"));
      mockDecryptFile.mockResolvedValue(new Uint8Array([1, 2, 3]));
      mockDecryptedDataToFile.mockReturnValue(
        new File(["test"], "test.pdf", { type: "application/pdf" })
      );

      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord();

      await act(async () => {
        await result.current.decrypt(mockRecord);
      });

      expect(mockGetEncryptedFile).toHaveBeenCalled();
    });

    it("calls decryptFile during decrypt phase", async () => {
      mockGetEncryptedFile.mockResolvedValue(createBlobMock("ciphertext"));
      mockDecryptFile.mockResolvedValue(new Uint8Array([1, 2, 3]));
      mockDecryptedDataToFile.mockReturnValue(
        new File(["test"], "test.pdf", { type: "application/pdf" })
      );

      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord();

      await act(async () => {
        await result.current.decrypt(mockRecord);
      });

      expect(mockDecryptFile).toHaveBeenCalled();
    });
  });

  describe("decrypt - acc_json parsing", () => {
    beforeEach(() => {
      mockGetEncryptedFile.mockResolvedValue(createBlobMock("ciphertext"));
      mockDecryptFile.mockResolvedValue(new Uint8Array([1, 2, 3]));
      mockDecryptedDataToFile.mockReturnValue(
        new File(["test"], "test.pdf", { type: "application/pdf" })
      );
    });

    it("parses stringified JSON acc_json", async () => {
      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord({
        acc_json: JSON.stringify([{ contractAddress: "0xParsedContract" }]),
      } as unknown as Partial<PatientRecord>);

      await act(async () => {
        await result.current.decrypt(mockRecord);
      });

      expect(mockDecryptFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        [{ contractAddress: "0xParsedContract" }],
        expect.any(Object)
      );
    });

    it("wraps non-array acc_json in array", async () => {
      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord({
        acc_json: { contractAddress: "0xSingleContract" },
      } as unknown as Partial<PatientRecord>);

      await act(async () => {
        await result.current.decrypt(mockRecord);
      });

      expect(mockDecryptFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        [{ contractAddress: "0xSingleContract" }],
        expect.any(Object)
      );
    });
  });

  describe("decrypt - error handling", () => {
    it("sets error status on fetch failure", async () => {
      mockGetEncryptedFile.mockRejectedValue(new Error("Fetch failed"));

      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord();

      await act(async () => {
        try {
          await result.current.decrypt(mockRecord);
        } catch {
          // Expected error
        }
      });

      expect(result.current.status).toBe("error");
      expect(result.current.error).toBe("Fetch failed");
    });

    it("sets error status on decryption failure", async () => {
      mockGetEncryptedFile.mockResolvedValue(createBlobMock("ciphertext"));
      mockDecryptFile.mockRejectedValue(new Error("Not authorized"));

      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord();

      await act(async () => {
        try {
          await result.current.decrypt(mockRecord);
        } catch {
          // Expected error
        }
      });

      expect(result.current.status).toBe("error");
      expect(result.current.error).toBe("Not authorized");
    });

    it("sets generic error message for non-Error throws", async () => {
      mockGetEncryptedFile.mockRejectedValue("string error");

      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord();

      await act(async () => {
        try {
          await result.current.decrypt(mockRecord);
        } catch {
          // Expected error
        }
      });

      expect(result.current.error).toBe("Decryption failed");
    });

    it("throws the original error", async () => {
      const originalError = new Error("Original error");
      mockGetEncryptedFile.mockRejectedValue(originalError);

      const { result } = renderHook(() => useDecrypt());
      const mockRecord = createMockRecord();

      await expect(
        act(async () => {
          await result.current.decrypt(mockRecord);
        })
      ).rejects.toThrow(originalError);
    });
  });

  describe("decrypt - researcher record support", () => {
    it("works with ResearcherRecord type", async () => {
      mockGetEncryptedFile.mockResolvedValue(createBlobMock("ciphertext"));
      mockDecryptFile.mockResolvedValue(new Uint8Array([1, 2, 3]));
      mockDecryptedDataToFile.mockReturnValue(
        new File(["test"], "test.pdf", { type: "application/pdf" })
      );

      const { result } = renderHook(() => useDecrypt());
      const researcherRecord: ResearcherRecord = {
        id: "record-123",
        name: "Shared Record.pdf",
        ipfs_cid: "QmSharedCid",
        data_to_encrypt_hash: "sharedHash",
        acc_json: [],
        patient_address: "0xPatient",
        created_at: "2025-01-01T00:00:00Z",
        consent_status: "granted",
        last_updated_consent: "2025-01-01T00:00:00Z",
      };

      await act(async () => {
        await result.current.decrypt(researcherRecord);
      });

      expect(result.current.status).toBe("success");
      expect(mockGetEncryptedFile).toHaveBeenCalledWith("QmSharedCid");
    });
  });
});
