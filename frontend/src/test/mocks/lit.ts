import { vi } from "vitest";

export const mockCiphertext = "mock-ciphertext-base64";
export const mockDataToEncryptHash = "mock-hash-abc123";
export const mockDecryptedData = new Uint8Array([72, 101, 108, 108, 111]);

export const createMockLitClient = () => ({
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  getSessionSigs: vi.fn().mockResolvedValue({}),
  decrypt: vi.fn().mockResolvedValue({
    decryptedData: mockDecryptedData,
  }),
});

export const mockEncryptFile = vi.fn().mockResolvedValue({
  ciphertext: mockCiphertext,
  dataToEncryptHash: mockDataToEncryptHash,
});

export const mockDecryptFile = vi.fn().mockResolvedValue(mockDecryptedData);

export const mockBuildEvmContractConditions = vi.fn().mockReturnValue([
  {
    contractAddress: "0xContractAddress",
    standardContractType: "",
    chain: "sepolia",
    method: "hasConsent",
    parameters: [":userAddress", "record-id", "0xPatientAddress"],
    returnValueTest: {
      comparator: "=",
      value: "true",
    },
  },
]);

export const mockGetLitClient = vi
  .fn()
  .mockResolvedValue(createMockLitClient());

export const mockDisconnectLit = vi.fn().mockResolvedValue(undefined);

export const mockGetSessionSignatures = vi.fn().mockResolvedValue({});

export const mockDecryptedDataToFile = vi
  .fn()
  .mockImplementation(
    (data: Uint8Array, filename: string, mimeType: string) =>
      new File([data], filename, { type: mimeType })
  );
