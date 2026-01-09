"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useResearcherRecords } from "@/hooks/useResearcherRecords";
import { ResearcherRecordsList } from "@/components/records/ResearcherRecordsList";

export default function SharedPage() {
  const { address } = useAuth();
  const { records, isLoading } = useResearcherRecords(address);

  return (
    <ProtectedRoute allowedRoles={["researcher"]}>
      <div className="bg-background min-h-screen">
        <header className="border-border border-b">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Consentis</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground text-sm">Researcher</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/researcher-profile">
                <Button variant="outline" size="sm">
                  <User className="mr-1 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <ConnectButton />
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Shared Records</h1>
              <p className="text-muted-foreground">
                View and download records shared with you
              </p>
            </div>

            <ResearcherRecordsList records={records} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
