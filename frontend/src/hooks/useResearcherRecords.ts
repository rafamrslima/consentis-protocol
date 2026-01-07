"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getResearcherRecords } from "@/services/api";

export function useResearcherRecords(researcherAddress: string | undefined) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["researcherRecords", researcherAddress],
    queryFn: () => getResearcherRecords(researcherAddress!),
    enabled: !!researcherAddress,
  });

  const invalidateRecords = () => {
    queryClient.invalidateQueries({
      queryKey: ["researcherRecords", researcherAddress],
    });
  };

  return {
    records: data ?? [],
    isLoading,
    error,
    invalidateRecords,
  };
}
