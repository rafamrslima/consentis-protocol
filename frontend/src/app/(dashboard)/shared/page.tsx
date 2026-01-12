"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { User, Search } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useResearcherRecords } from "@/hooks/useResearcherRecords";
import { ResearcherRecordsList } from "@/components/records/ResearcherRecordsList";

export default function SharedPage() {
  const { address } = useAuth();
  const { records, isLoading } = useResearcherRecords(address);
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: Replace with backend search for better performance on large datasets
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const query = searchQuery.toLowerCase();
    return records.filter((record) =>
      record.name.toLowerCase().includes(query)
    );
  }, [records, searchQuery]);

  return (
    <ProtectedRoute allowedRoles={["researcher"]}>
      <div className="min-h-screen">
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Shared Records</h1>
                <p className="text-muted-foreground">
                  View and download records shared with you
                </p>
              </div>
              <div className="relative w-64">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search by record name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <ResearcherRecordsList
              records={filteredRecords}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
