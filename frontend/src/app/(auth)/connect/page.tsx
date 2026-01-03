"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { RoleSelector } from "@/components/wallet/RoleSelector";
import { useAuth } from "@/hooks/useAuth";

export default function ConnectPage() {
  const router = useRouter();
  const {
    isConnected,
    isConnecting,
    isAuthenticated,
    needsRoleSelection,
    role,
    selectRole,
  } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && role) {
      const destination = role === "patient" ? "/records" : "/shared";
      router.push(destination);
    }
  }, [isAuthenticated, role, router]);

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
            <p className="text-center text-muted-foreground">
              Connect your wallet to get started
            </p>
            <ConnectButton />
          </div>
        ) : needsRoleSelection ? (
          <RoleSelector onSelect={selectRole} isLoading={isConnecting} />
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <ConnectButton />
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
}
