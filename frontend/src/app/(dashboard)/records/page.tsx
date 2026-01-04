"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RecordUploadForm } from "@/components/records/RecordUploadForm";

export default function RecordsPage() {
  const { address, role } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [lastCid, setLastCid] = useState<string | null>(null);

  const handleUploadSuccess = (cid: string) => {
    setLastCid(cid);
  };

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Records</h1>
              <p className="text-muted-foreground">
                Manage your encrypted health records
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Health Record</DialogTitle>
                    <DialogDescription>
                      Your file will be encrypted before upload. Only authorized
                      researchers can decrypt it.
                    </DialogDescription>
                  </DialogHeader>
                  {address && (
                    <RecordUploadForm
                      patientAddress={address}
                      onSuccess={handleUploadSuccess}
                      onClose={() => setIsUploadOpen(false)}
                    />
                  )}
                </DialogContent>
              </Dialog>
              <ConnectButton />
            </div>
          </div>

          {lastCid && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-green-800">
                Last uploaded CID:{" "}
                <code className="rounded bg-green-100 px-2 py-1 text-sm">
                  {lastCid}
                </code>
              </p>
            </div>
          )}

          <div className="text-muted-foreground rounded-lg border p-8 text-center">
            <p>
              No records yet. Upload your first health record to get started.
            </p>
          </div>

          <div className="text-muted-foreground text-sm">
            <p>Connected: {address}</p>
            <p>Role: {role}</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
