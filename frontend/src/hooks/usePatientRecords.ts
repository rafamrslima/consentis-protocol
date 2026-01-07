"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPatientRecords } from "@/services/api";
import type { PatientRecord } from "@/types";

export const PATIENT_RECORDS_KEY = "patientRecords";

export function usePatientRecords(patientAddress: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery<PatientRecord[]>({
    queryKey: [PATIENT_RECORDS_KEY, patientAddress],
    queryFn: () => getPatientRecords(patientAddress!),
    enabled: !!patientAddress,
  });

  const invalidateRecords = () => {
    queryClient.invalidateQueries({
      queryKey: [PATIENT_RECORDS_KEY, patientAddress],
    });
  };

  return {
    records: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidateRecords,
  };
}
