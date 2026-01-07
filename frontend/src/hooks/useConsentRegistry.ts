"use client";

import { useCallback } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import {
  CONSENT_REGISTRY_ABI,
  CONSENT_REGISTRY_ADDRESS,
} from "@/contracts/consentRegistry";

export function useConsentRegistry() {
  const {
    writeContract,
    data: hash,
    isPending,
    isSuccess: isConfirmed,
    error,
    reset,
  } = useWriteContract();

  const grantConsent = useCallback(
    (researcherAddress: `0x${string}`, recordId: string) => {
      writeContract({
        address: CONSENT_REGISTRY_ADDRESS,
        abi: CONSENT_REGISTRY_ABI,
        functionName: "grantConsent",
        args: [researcherAddress, recordId],
      });
    },
    [writeContract]
  );

  const revokeConsent = useCallback(
    (researcherAddress: `0x${string}`, recordId: string) => {
      writeContract({
        address: CONSENT_REGISTRY_ADDRESS,
        abi: CONSENT_REGISTRY_ABI,
        functionName: "revokeConsent",
        args: [researcherAddress, recordId],
      });
    },
    [writeContract]
  );

  return {
    grantConsent,
    revokeConsent,
    isPending,
    isConfirmed,
    error,
    hash,
    reset,
  };
}

export function useCheckConsent(
  patientAddress: `0x${string}` | undefined,
  researcherAddress: `0x${string}` | undefined,
  recordId: string | undefined
) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONSENT_REGISTRY_ADDRESS,
    abi: CONSENT_REGISTRY_ABI,
    functionName: "hasConsent",
    args:
      patientAddress && researcherAddress && recordId
        ? [patientAddress, researcherAddress, recordId]
        : undefined,
    query: {
      enabled: !!patientAddress && !!researcherAddress && !!recordId,
    },
  });

  return {
    hasConsent: data as boolean | undefined,
    isLoading,
    refetch,
  };
}
