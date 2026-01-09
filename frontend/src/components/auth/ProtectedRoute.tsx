"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useResearcherProfile } from "@/hooks/useResearcherProfile";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const {
    address,
    isConnected,
    isLoading,
    isAuthenticated,
    role,
    needsRoleSelection,
  } = useAuth();

  const shouldCheckProfile =
    role === "researcher" && allowedRoles?.includes("researcher");
  const { isChecking, needsProfile } = useResearcherProfile(
    shouldCheckProfile ? address : undefined
  );

  useEffect(() => {
    if (isLoading) return;

    if (!isConnected) {
      router.push("/connect");
      return;
    }

    if (needsRoleSelection) {
      router.push("/connect");
      return;
    }

    if (role === "researcher" && !isChecking && needsProfile) {
      router.push("/researcher-profile");
      return;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      const destination = role === "patient" ? "/records" : "/shared";
      router.push(destination);
    }
  }, [
    isConnected,
    isLoading,
    isAuthenticated,
    role,
    needsRoleSelection,
    allowedRoles,
    router,
    isChecking,
    needsProfile,
  ]);

  if (isLoading || (shouldCheckProfile && isChecking)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (role === "researcher" && needsProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
