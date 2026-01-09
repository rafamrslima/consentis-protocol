"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { RoleSelector } from "@/components/wallet/RoleSelector";
import { useAuth } from "@/hooks/useAuth";
import { useResearcherProfile } from "@/hooks/useResearcherProfile";

export default function ConnectPage() {
  const router = useRouter();
  const {
    address,
    isConnected,
    isLoading,
    isAuthenticated,
    needsRoleSelection,
    role,
    selectRole,
    profileStatus,
  } = useAuth();

  const { checkProfile, isChecking, hasProfile, needsProfile } =
    useResearcherProfile(role === "researcher" ? address : undefined);

  useEffect(() => {
    if (role === "researcher" && address && profileStatus === "unknown") {
      checkProfile();
    }
  }, [role, address, profileStatus, checkProfile]);

  useEffect(() => {
    if (isLoading || isChecking) return;

    if (!isAuthenticated || !role) return;

    if (role === "patient") {
      router.push("/records");
      return;
    }

    if (role === "researcher") {
      if (needsProfile) {
        router.push("/researcher-profile");
      } else if (hasProfile) {
        router.push("/shared");
      }
    }
  }, [
    isAuthenticated,
    role,
    isLoading,
    isChecking,
    hasProfile,
    needsProfile,
    router,
  ]);

  const showLoading = isLoading || (role === "researcher" && isChecking);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Consentis Protocol</h1>
          <p className="text-muted-foreground mt-2">
            Decentralized Health Data Management
          </p>
        </div>

        {!isConnected ? (
          <div className="flex flex-col items-center space-y-6">
            <p className="text-muted-foreground text-center">
              Connect your wallet to get started
            </p>
            <ConnectButton />
          </div>
        ) : needsRoleSelection ? (
          <RoleSelector onSelect={selectRole} isLoading={showLoading} />
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <ConnectButton />
            <p className="text-muted-foreground text-sm">
              {isChecking ? "Checking profile..." : "Redirecting..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
