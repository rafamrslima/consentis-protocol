"use client";

import { useState } from "react";
import { FileText, Shield, Download, Loader2 } from "lucide-react";
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
import { ManageAccessDialog } from "@/components/access/ManageAccessDialog";
import { useDecrypt } from "@/hooks/useDecrypt";
import type { PatientRecord } from "@/types";

interface RecordsListProps {
  records: PatientRecord[];
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

function RecordsListSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-48">Actions</TableHead>
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
                <Skeleton className="h-4 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-32" />
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
      <p>No records yet. Upload your first health record to get started.</p>
    </div>
  );
}

export function RecordsList({ records, isLoading }: RecordsListProps) {
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(
    null
  );
  const [decryptingId, setDecryptingId] = useState<string | null>(null);
  const { decrypt, status } = useDecrypt();

  const handleDownload = async (record: PatientRecord) => {
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
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-48">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <FileText className="text-muted-foreground h-5 w-5" />
                </TableCell>
                <TableCell className="font-medium">{record.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(record.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(record)}
                      disabled={decryptingId === record.id}
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
                        : "View"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <Shield className="mr-1 h-4 w-4" />
                      Access
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ManageAccessDialog
        open={!!selectedRecord}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
        recordId={selectedRecord?.id ?? ""}
        recordName={selectedRecord?.name ?? ""}
      />
    </>
  );
}
