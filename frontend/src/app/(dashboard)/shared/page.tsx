"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

export default function SharedPage() {
  const { address, role } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["researcher"]}>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 gap-6">
        <h1 className="text-2xl font-bold">Researcher Dashboard</h1>
        <p className="text-muted-foreground">Connected: {address}</p>
        <p className="text-muted-foreground">Role: {role}</p>
        <ConnectButton />
      </div>
    </ProtectedRoute>
  );
}
