"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { usePatientRecords } from "@/hooks/usePatientRecords";
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
import { RecordsList } from "@/components/records/RecordsList";

export default function RecordsPage() {
  const { address } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { records, isLoading, invalidateRecords } = usePatientRecords(address);

  const handleUploadSuccess = () => {
    invalidateRecords();
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
                  <Button className="cursor-pointer">
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

          <RecordsList records={records} isLoading={isLoading} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
