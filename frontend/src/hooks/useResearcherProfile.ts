"use client";

import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import {
  getResearcherProfileByAddress,
  createResearcherProfile,
} from "@/services/api";

export const RESEARCHER_PROFILE_KEY = "researcherProfile";

export function useResearcherProfile(address: string | undefined) {
  const queryClient = useQueryClient();
  const {
    researcherProfileId,
    profileStatus,
    setResearcherProfile,
    setProfileStatus,
  } = useUserStore();

  const shouldCheck = !!address && profileStatus === "unknown";

  const checkQuery = useQuery({
    queryKey: [RESEARCHER_PROFILE_KEY, address],
    queryFn: async () => {
      setProfileStatus("checking");
      const profileId = await getResearcherProfileByAddress(address!);
      setResearcherProfile(profileId || "");
      return profileId;
    },
    enabled: shouldCheck,
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: createResearcherProfile,
    onSuccess: (profileId) => {
      setResearcherProfile(profileId);
      queryClient.invalidateQueries({
        queryKey: [RESEARCHER_PROFILE_KEY, address],
      });
    },
  });

  const checkProfile = useCallback(() => {
    if (address && profileStatus === "unknown") {
      checkQuery.refetch();
    }
  }, [address, profileStatus, checkQuery]);

  const hasProfile = profileStatus === "complete";
  const needsProfile = profileStatus === "incomplete";

  return {
    profileId: researcherProfileId,
    profileStatus,
    isChecking: checkQuery.isLoading || profileStatus === "checking",
    hasProfile,
    needsProfile,

    checkProfile,
    createProfile: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}
