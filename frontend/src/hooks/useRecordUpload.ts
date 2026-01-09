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
  | "uploading"
  | "registering"
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
      // Step 1: Generate UUID for the record
      const recordId = crypto.randomUUID();

      // Step 2: Encrypt the file (returns evmContractConditions used for encryption)
      setStatus("encrypting");
      const { encryptedBlob, dataToEncryptHash, evmContractConditions } =
        await encryptFile(file, patientAddress, recordId);

      // Step 3: Upload to backend with the same conditions used for encryption
      setStatus("uploading");
      const result = await createRecord({
        recordId,
        name,
        patientAddress,
        dataToEncryptHash,
        accJson: evmContractConditions,
        encryptedFile: encryptedBlob,
      });

      // Step 4: Register record on blockchain
      setStatus("registering");
      console.log("[Blockchain] Registering record:", {
        recordId,
        contractAddress: CONSENT_REGISTRY_ADDRESS,
        patientAddress,
      });

      const hash = await writeContractAsync({
        address: CONSENT_REGISTRY_ADDRESS,
        abi: CONSENT_REGISTRY_ABI,
        functionName: "registerRecord",
        args: [recordId],
      });

      console.log("[Blockchain] Transaction submitted:", hash);

      const receipt = await waitForTransactionReceipt(config, { hash });

      console.log("[Blockchain] Transaction confirmed:", {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
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
