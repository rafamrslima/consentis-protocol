"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import {
  getResearcherProfileByAddress,
  createResearcherProfile,
  updateResearcherProfile,
  type ResearcherProfileResponse,
  type UpdateResearcherProfileRequest,
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
      const profile = await getResearcherProfileByAddress(address!);
      setResearcherProfile(profile?.id || "");
      return profile;
    },
    enabled: shouldCheck,
    staleTime: 0,
  });

  const profileQuery = useQuery({
    queryKey: [RESEARCHER_PROFILE_KEY, "data", address],
    queryFn: () => getResearcherProfileByAddress(address!),
    enabled: !!address && profileStatus === "complete",
    staleTime: 0,
    refetchOnMount: "always",
  });

  const createMutation = useMutation({
    mutationFn: createResearcherProfile,
    onSuccess: (profileId) => {
      setResearcherProfile(profileId);
      queryClient.invalidateQueries({
        queryKey: [RESEARCHER_PROFILE_KEY],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (profile: UpdateResearcherProfileRequest) =>
      updateResearcherProfile(address!, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [RESEARCHER_PROFILE_KEY],
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

  const profile: ResearcherProfileResponse | null =
    checkQuery.data || profileQuery.data || null;

  return {
    profileId: researcherProfileId,
    profileStatus,
    profile,
    isChecking: checkQuery.isLoading || profileStatus === "checking",
    isLoadingProfile: profileQuery.isLoading || profileQuery.isFetching,
    hasProfile,
    needsProfile,

    checkProfile,
    createProfile: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}
