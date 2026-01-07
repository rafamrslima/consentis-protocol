"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useResearcherRecords } from "@/hooks/useResearcherRecords";
import { ResearcherRecordsList } from "@/components/records/ResearcherRecordsList";

export default function SharedPage() {
  const { address } = useAuth();
  const { records, isLoading } = useResearcherRecords(address);

  return (
    <ProtectedRoute allowedRoles={["researcher"]}>
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Shared Records</h1>
              <p className="text-muted-foreground">
                View and decrypt records shared with you
              </p>
            </div>
            <ConnectButton />
          </div>

          <ResearcherRecordsList records={records} isLoading={isLoading} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
