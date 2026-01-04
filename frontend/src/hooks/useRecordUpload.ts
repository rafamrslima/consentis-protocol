"use client";

import { useState } from "react";
import { useWalletClient } from "wagmi";
import { encryptFile, buildAccessControlConditions } from "@/services/lit";
import { createRecord } from "@/services/api";

export type UploadStatus =
  | "idle"
  | "encrypting"
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

      // Step 1: Encrypt the file
      setStatus("encrypting");
      const { encryptedBlob, dataToEncryptHash } = await encryptFile(
        file,
        patientAddress,
        recordId
      );

      // Step 2: Build access control conditions
      const accJson = buildAccessControlConditions(patientAddress, recordId);

      // Step 3: Upload to backend
      setStatus("uploading");
      const result = await createRecord({
        name,
        patientAddress,
        dataToEncryptHash,
        accJson,
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
