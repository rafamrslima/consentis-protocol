import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.unmock("@/services/lit");

import { buildEvmContractConditions, decryptedDataToFile } from "../lit";

vi.mock("@lit-protocol/lit-node-client", () => ({
  LitNodeClient: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    ready: false,
    encrypt: vi.fn().mockResolvedValue({
      ciphertext: "mock-ciphertext",
      dataToEncryptHash: "mock-hash",
    }),
    decrypt: vi.fn().mockResolvedValue({
      decryptedData: new Uint8Array([72, 101, 108, 108, 111]),
    }),
    getSessionSigs: vi.fn().mockResolvedValue({}),
    getLatestBlockhash: vi.fn().mockResolvedValue("mock-blockhash"),
  })),
}));

vi.mock("@lit-protocol/auth-helpers", () => ({
  createSiweMessage: vi.fn().mockResolvedValue("mock-siwe-message"),
  generateAuthSig: vi.fn().mockResolvedValue({
    sig: "mock-sig",
    derivedVia: "web3.eth.personal.sign",
    signedMessage: "mock-message",
    address: "0x123",
  }),
  LitAccessControlConditionResource: vi.fn().mockImplementation((id) => ({
    resourceId: id,
  })),
}));

describe("Lit Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("buildEvmContractConditions", () => {
    it("builds correct condition structure", () => {
      const conditions = buildEvmContractConditions("0xPatient123", "record-1");

      expect(conditions).toHaveLength(1);
      expect(conditions[0]).toMatchObject({
        chain: "sepolia",
        functionName: "checkAccess",
        returnValueTest: {
          comparator: "=",
          value: "true",
        },
      });
    });

    it("includes patient address in function params", () => {
      const conditions = buildEvmContractConditions("0xPatient123", "record-1");

      expect(conditions[0].functionParams).toContain("0xPatient123");
    });

    it("includes :userAddress placeholder for researcher", () => {
      const conditions = buildEvmContractConditions("0xPatient123", "record-1");

      expect(conditions[0].functionParams).toContain(":userAddress");
    });

    it("includes record id in function params", () => {
      const conditions = buildEvmContractConditions("0xPatient123", "record-1");

      expect(conditions[0].functionParams).toContain("record-1");
    });

    it("has correct function ABI structure", () => {
      const conditions = buildEvmContractConditions("0xPatient123", "record-1");
      const abi = conditions[0].functionAbi;

      expect(abi.name).toBe("checkAccess");
      expect(abi.inputs).toHaveLength(3);
      expect(abi.inputs[0]).toEqual({ name: "patient", type: "address" });
      expect(abi.inputs[1]).toEqual({ name: "researcher", type: "address" });
      expect(abi.inputs[2]).toEqual({ name: "recordId", type: "string" });
      expect(abi.outputs).toEqual([{ name: "", type: "bool" }]);
      expect(abi.stateMutability).toBe("view");
    });

    it("params are in correct order: patient, researcher, recordId", () => {
      const conditions = buildEvmContractConditions("0xPatient", "rec-123");
      const params = conditions[0].functionParams;

      expect(params[0]).toBe("0xPatient");
      expect(params[1]).toBe(":userAddress");
      expect(params[2]).toBe("rec-123");
    });
  });

  describe("decryptedDataToFile", () => {
    it("converts Uint8Array to File", () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const file = decryptedDataToFile(data, "test.txt");

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe("test.txt");
    });

    it("sets default mime type to application/octet-stream", () => {
      const data = new Uint8Array([1, 2, 3]);
      const file = decryptedDataToFile(data, "test.bin");

      expect(file.type).toBe("application/octet-stream");
    });

    it("sets custom mime type when provided", () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]);
      const file = decryptedDataToFile(data, "test.txt", "text/plain");

      expect(file.type).toBe("text/plain");
    });

    it("preserves data size", () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const file = decryptedDataToFile(data, "test.bin");

      expect(file.size).toBe(5);
    });

    it("handles empty data", () => {
      const data = new Uint8Array([]);
      const file = decryptedDataToFile(data, "empty.bin");

      expect(file.size).toBe(0);
      expect(file.name).toBe("empty.bin");
    });

    it("handles large data arrays", () => {
      const data = new Uint8Array(10000).fill(42);
      const file = decryptedDataToFile(data, "large.bin");

      expect(file.size).toBe(10000);
    });

    it("creates file with correct filename regardless of mime type", () => {
      const data = new Uint8Array([1, 2, 3]);
      const file = decryptedDataToFile(data, "report.pdf", "application/pdf");

      expect(file.name).toBe("report.pdf");
      expect(file.type).toBe("application/pdf");
    });
  });
});
