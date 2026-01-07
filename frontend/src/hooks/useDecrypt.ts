"use client";

// TODO: Add toast notifications for better error UX
// - Show user-friendly error messages instead of raw errors
// - Use sonner or react-hot-toast for toast notifications
// - Handle specific error cases (not authorized, network error, etc.)

import { useState } from "react";
import { useWalletClient } from "wagmi";
import { getEncryptedFile } from "@/services/api";
import { decryptFile, decryptedDataToFile } from "@/services/lit";
import type { EvmContractConditions } from "@lit-protocol/types";
import type { PatientRecord, ResearcherRecord } from "@/types";

export type DecryptStatus =
  | "idle"
  | "fetching"
  | "decrypting"
  | "success"
  | "error";

interface UseDecryptReturn {
  decrypt: (record: PatientRecord | ResearcherRecord) => Promise<File>;
  status: DecryptStatus;
  error: string | null;
  reset: () => void;
}

function parseAccJson(accJson: unknown): EvmContractConditions {
  let acc = accJson;

  // Handle stringified JSON
  if (typeof acc === "string") {
    try {
      acc = JSON.parse(acc);
    } catch {
      throw new Error("Invalid ACC format: cannot parse JSON");
    }
  }

  // Ensure it's an array (Lit SDK expects array)
  if (!Array.isArray(acc)) {
    acc = [acc];
  }

  return acc as EvmContractConditions;
}

export function useDecrypt(): UseDecryptReturn {
  const [status, setStatus] = useState<DecryptStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const { data: walletClient } = useWalletClient();

  const reset = () => {
    setStatus("idle");
    setError(null);
  };

  const decrypt = async (
    record: PatientRecord | ResearcherRecord
  ): Promise<File> => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    setError(null);

    try {
      setStatus("fetching");
      const encryptedBlob = await getEncryptedFile(record.ipfs_cid);
      const ciphertext = await encryptedBlob.text();

      setStatus("decrypting");
      const evmContractConditions = parseAccJson(record.acc_json);

      const decryptedData = await decryptFile(
        ciphertext,
        record.data_to_encrypt_hash,
        evmContractConditions,
        walletClient
      );

      const file = decryptedDataToFile(decryptedData, record.name);
      setStatus("success");
      return file;
    } catch (err) {
      setStatus("error");
      const message = err instanceof Error ? err.message : "Decryption failed";
      console.error("[useDecrypt] Error:", err);
      setError(message);
      throw err;
    }
  };

  return { decrypt, status, error, reset };
}
