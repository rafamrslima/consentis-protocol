"use client";

import { useState } from "react";
import { useWalletClient, useWriteContract, useConfig } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { encryptFile } from "@/services/lit";
import { createRecord } from "@/services/api";
import {
  CONSENT_REGISTRY_ABI,
  CONSENT_REGISTRY_ADDRESS,
} from "@/contracts/consentRegistry";

export type UploadStatus =
  | "idle"
  | "encrypting"
  | "registering"
  | "uploading"
  | "success"
  | "error";

interface UseRecordUploadReturn {
  upload: (file: File, name: string, patientAddress: string) => Promise<string>;
  status: UploadStatus;
  error: string | null;
  reset: () => void;
}

export function useRecordUpload(): UseRecordUploadReturn {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();

  const reset = () => {
    setStatus("idle");
    setError(null);
  };

  const upload = async (
    file: File,
    name: string,
    patientAddress: string
  ): Promise<string> => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    setError(null);

    try {
      // Generate a unique record ID
      const recordId = `record_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Step 1: Encrypt the file (returns evmContractConditions used for encryption)
      setStatus("encrypting");
      const { encryptedBlob, dataToEncryptHash, evmContractConditions } =
        await encryptFile(file, patientAddress, recordId);

      // Step 2: Register record on blockchain
      setStatus("registering");
      const hash = await writeContractAsync({
        address: CONSENT_REGISTRY_ADDRESS,
        abi: CONSENT_REGISTRY_ABI,
        functionName: "registerRecord",
        args: [recordId],
      });

      await waitForTransactionReceipt(config, { hash });

      // Step 3: Upload to backend with the same conditions used for encryption
      setStatus("uploading");
      const result = await createRecord({
        name,
        patientAddress,
        dataToEncryptHash,
        accJson: evmContractConditions,
        encryptedFile: encryptedBlob,
      });

      setStatus("success");
      return result.cid;
    } catch (err) {
      setStatus("error");
      console.error("[useRecordUpload] Upload failed:", err);
      setError("Upload failed. Please try again.");
      throw err;
    }
  };

  return { upload, status, error, reset };
}
