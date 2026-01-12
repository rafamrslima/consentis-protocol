import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRecordUpload } from "../useRecordUpload";

const mockWriteContractAsync = vi.fn();
const mockWalletClient = { account: { address: "0xPatient" } };

vi.mock("wagmi", () => ({
  useWalletClient: vi.fn(() => ({ data: mockWalletClient })),
  useWriteContract: vi.fn(() => ({
    writeContractAsync: mockWriteContractAsync,
  })),
  useConfig: vi.fn(() => ({})),
}));

vi.mock("@wagmi/core", () => ({
  waitForTransactionReceipt: vi.fn(() =>
    Promise.resolve({
      transactionHash: "0xReceiptHash",
      blockNumber: 12345n,
      status: "success",
    })
  ),
}));

const mockEncryptFile = vi.fn();
vi.mock("@/services/lit", () => ({
  encryptFile: (...args: unknown[]) => mockEncryptFile(...args),
}));

const mockCreateRecord = vi.fn();
vi.mock("@/services/api", () => ({
  createRecord: (...args: unknown[]) => mockCreateRecord(...args),
}));

vi.mock("@/contracts/consentRegistry", () => ({
  CONSENT_REGISTRY_ADDRESS: "0xContractAddress" as `0x${string}`,
  CONSENT_REGISTRY_ABI: [],
}));

import { useWalletClient } from "wagmi";

describe("useRecordUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(useWalletClient).mockReturnValue({
      data: mockWalletClient,
    } as unknown as ReturnType<typeof useWalletClient>);
  });

  describe("initial state", () => {
    it("returns upload function", () => {
      const { result } = renderHook(() => useRecordUpload());
      expect(typeof result.current.upload).toBe("function");
    });

    it("returns status as idle initially", () => {
      const { result } = renderHook(() => useRecordUpload());
      expect(result.current.status).toBe("idle");
    });

    it("returns error as null initially", () => {
      const { result } = renderHook(() => useRecordUpload());
      expect(result.current.error).toBeNull();
    });

    it("returns reset function", () => {
      const { result } = renderHook(() => useRecordUpload());
      expect(typeof result.current.reset).toBe("function");
    });
  });

  describe("reset", () => {
    it("resets status to idle", async () => {
      mockEncryptFile.mockRejectedValueOnce(new Error("Test error"));

      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      await act(async () => {
        try {
          await result.current.upload(mockFile, "Test Record", "0xPatient");
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

  describe("upload - wallet not connected", () => {
    it("throws error when wallet is not connected", async () => {
      vi.mocked(useWalletClient).mockReturnValue({
        data: undefined,
      } as unknown as ReturnType<typeof useWalletClient>);

      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      await expect(
        act(async () => {
          await result.current.upload(mockFile, "Test Record", "0xPatient");
        })
      ).rejects.toThrow("Wallet not connected");
    });
  });

  describe("upload - success flow", () => {
    beforeEach(() => {
      mockEncryptFile.mockResolvedValue({
        encryptedBlob: new Blob(["encrypted"]),
        dataToEncryptHash: "hash123",
        evmContractConditions: [],
      });
      mockCreateRecord.mockResolvedValue({ cid: "QmTestCid" });
      mockWriteContractAsync.mockResolvedValue("0xTxHash");
    });

    it("calls encryptFile during upload process", async () => {
      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      await act(async () => {
        await result.current.upload(mockFile, "Test Record", "0xPatient");
      });

      expect(mockEncryptFile).toHaveBeenCalled();
    });

    it("calls encryptFile with correct parameters", async () => {
      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      await act(async () => {
        await result.current.upload(mockFile, "Test Record", "0xPatient");
      });

      expect(mockEncryptFile).toHaveBeenCalledWith(
        mockFile,
        "0xPatient",
        expect.any(String)
      );
    });

    it("calls createRecord with correct parameters", async () => {
      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      await act(async () => {
        await result.current.upload(mockFile, "Test Record", "0xPatient");
      });

      expect(mockCreateRecord).toHaveBeenCalledWith({
        recordId: expect.any(String),
        name: "Test Record",
        patientAddress: "0xPatient",
        dataToEncryptHash: "hash123",
        accJson: [],
        encryptedFile: expect.any(Blob),
      });
    });

    it("calls writeContractAsync for blockchain registration", async () => {
      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      await act(async () => {
        await result.current.upload(mockFile, "Test Record", "0xPatient");
      });

      expect(mockWriteContractAsync).toHaveBeenCalledWith({
        address: "0xContractAddress",
        abi: [],
        functionName: "registerRecord",
        args: [expect.any(String)],
      });
    });

    it("returns CID on successful upload", async () => {
      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      let cid: string = "";
      await act(async () => {
        cid = await result.current.upload(mockFile, "Test Record", "0xPatient");
      });

      expect(cid).toBe("QmTestCid");
    });

    it("ends with success status", async () => {
      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      await act(async () => {
        await result.current.upload(mockFile, "Test Record", "0xPatient");
      });

      expect(result.current.status).toBe("success");
    });
  });

  describe("upload - error handling", () => {
    it("sets error status on encryption failure", async () => {
      mockEncryptFile.mockRejectedValue(new Error("Encryption failed"));

      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      await act(async () => {
        try {
          await result.current.upload(mockFile, "Test Record", "0xPatient");
        } catch {
          // Expected error
        }
      });

      expect(result.current.status).toBe("error");
      expect(result.current.error).toBe("Upload failed. Please try again.");
    });

    it("sets error status on upload failure", async () => {
      mockEncryptFile.mockResolvedValue({
        encryptedBlob: new Blob(["encrypted"]),
        dataToEncryptHash: "hash123",
        evmContractConditions: [],
      });
      mockCreateRecord.mockRejectedValue(new Error("Upload failed"));

      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      await act(async () => {
        try {
          await result.current.upload(mockFile, "Test Record", "0xPatient");
        } catch {
          // Expected error
        }
      });

      expect(result.current.status).toBe("error");
    });

    it("sets error status on blockchain registration failure", async () => {
      mockEncryptFile.mockResolvedValue({
        encryptedBlob: new Blob(["encrypted"]),
        dataToEncryptHash: "hash123",
        evmContractConditions: [],
      });
      mockCreateRecord.mockResolvedValue({ cid: "QmTestCid" });
      mockWriteContractAsync.mockRejectedValue(
        new Error("Transaction rejected")
      );

      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      await act(async () => {
        try {
          await result.current.upload(mockFile, "Test Record", "0xPatient");
        } catch {
          // Expected error
        }
      });

      expect(result.current.status).toBe("error");
    });

    it("throws the original error", async () => {
      const originalError = new Error("Original error");
      mockEncryptFile.mockRejectedValue(originalError);

      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      await expect(
        act(async () => {
          await result.current.upload(mockFile, "Test Record", "0xPatient");
        })
      ).rejects.toThrow(originalError);
    });
  });

  describe("upload - generates unique record ID", () => {
    it("generates UUID for each upload", async () => {
      mockEncryptFile.mockResolvedValue({
        encryptedBlob: new Blob(["encrypted"]),
        dataToEncryptHash: "hash123",
        evmContractConditions: [],
      });
      mockCreateRecord.mockResolvedValue({ cid: "QmTestCid" });
      mockWriteContractAsync.mockResolvedValue("0xTxHash");

      const { result } = renderHook(() => useRecordUpload());
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      await act(async () => {
        await result.current.upload(mockFile, "Test Record", "0xPatient");
      });

      const firstCallRecordId = mockEncryptFile.mock.calls[0][2];
      expect(firstCallRecordId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });
});
