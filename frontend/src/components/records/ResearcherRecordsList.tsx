"use client";

import { useState } from "react";
import {
  FileText,
  ExternalLink,
  Download,
  Loader2,
  Lock,
  Unlock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDecrypt } from "@/hooks/useDecrypt";
import type { ResearcherRecord } from "@/types";

interface ResearcherRecordsListProps {
  records: ResearcherRecord[];
  isLoading: boolean;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateCid(cid: string): string {
  if (cid.length <= 16) return cid;
  return `${cid.slice(0, 8)}...${cid.slice(-8)}`;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function RecordsListSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-5" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-muted-foreground rounded-lg border p-8 text-center">
      <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
      <p>No shared records available.</p>
      <p className="mt-2 text-sm">
        Records will appear here when patients grant you access.
      </p>
    </div>
  );
}

function ConsentBadge({ status }: { status: string }) {
  if (status === "granted") {
    return (
      <Badge variant="default" className="bg-green-600">
        <Unlock className="mr-1 h-3 w-3" />
        Granted
      </Badge>
    );
  }
  if (status === "revoked") {
    return (
      <Badge variant="destructive">
        <Lock className="mr-1 h-3 w-3" />
        Revoked
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <Lock className="mr-1 h-3 w-3" />
      No Access
    </Badge>
  );
}

export function ResearcherRecordsList({
  records,
  isLoading,
}: ResearcherRecordsListProps) {
  const [decryptingId, setDecryptingId] = useState<string | null>(null);
  const { decrypt, status } = useDecrypt();

  const handleDownload = async (record: ResearcherRecord) => {
    try {
      setDecryptingId(record.id);
      const file = await decrypt(record);
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = record.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDecryptingId(null);
    }
  };

  if (isLoading) {
    return <RecordsListSkeleton />;
  }

  if (records.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>IPFS CID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <FileText className="text-muted-foreground h-5 w-5" />
              </TableCell>
              <TableCell className="font-medium">{record.name}</TableCell>
              <TableCell className="font-mono text-sm">
                {truncateAddress(record.patient_address)}
              </TableCell>
              <TableCell>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${record.ipfs_cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono text-sm transition-colors"
                >
                  {truncateCid(record.ipfs_cid)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
              <TableCell>
                <ConsentBadge status={record.consent_status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(record.created_at)}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(record)}
                  disabled={
                    decryptingId === record.id ||
                    record.consent_status !== "granted"
                  }
                >
                  {decryptingId === record.id ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-1 h-4 w-4" />
                  )}
                  {decryptingId === record.id
                    ? status === "fetching"
                      ? "Fetching..."
                      : "Decrypting..."
                    : "Decrypt"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
