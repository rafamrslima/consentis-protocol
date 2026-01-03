"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isConnected, isLoading, isAuthenticated, role, needsRoleSelection } =
    useAuth();

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

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      const destination = role === "patient" ? "/records" : "/shared";
      router.push(destination);
    }
  }, [isConnected, isLoading, isAuthenticated, role, needsRoleSelection, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">Redirecting...</div>
      </div>
    );
  }

  return <>{children}</>;
}
