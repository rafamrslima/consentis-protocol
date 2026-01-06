"use client";

import { useState } from "react";
import { Loader2, UserPlus, UserMinus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConsentRegistry } from "@/hooks/useConsentRegistry";

interface ManageAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: string;
  recordName: string;
}

function isValidAddress(address: string): address is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function ManageAccessDialog({
  open,
  onOpenChange,
  recordId,
  recordName,
}: ManageAccessDialogProps) {
  const [researcherAddress, setResearcherAddress] = useState("");
  const [action, setAction] = useState<"grant" | "revoke" | null>(null);

  const {
    grantConsent,
    revokeConsent,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    reset,
  } = useConsentRegistry();

  const isLoading = isPending || isConfirming;
  const isValidInput = isValidAddress(researcherAddress);

  const handleGrant = () => {
    if (!isValidInput) return;
    setAction("grant");
    grantConsent(researcherAddress as `0x${string}`, recordId);
  };

  const handleRevoke = () => {
    if (!isValidInput) return;
    setAction("revoke");
    revokeConsent(researcherAddress as `0x${string}`, recordId);
  };

  const handleClose = () => {
    setResearcherAddress("");
    setAction(null);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Access</DialogTitle>
          <DialogDescription>
            Grant or revoke researcher access to:{" "}
            <span className="font-medium">{recordName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="researcher">Researcher Address</Label>
            <Input
              id="researcher"
              placeholder="0x..."
              value={researcherAddress}
              onChange={(e) => setResearcherAddress(e.target.value)}
              disabled={isLoading}
              className="font-mono"
            />
            {researcherAddress && !isValidInput && (
              <p className="text-sm text-red-500">
                Invalid Ethereum address format
              </p>
            )}
          </div>

          {isConfirmed && (
            <div className="rounded-lg bg-green-50 p-3 text-green-700">
              Access {action === "grant" ? "granted" : "revoked"} successfully!
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-red-700">
              Transaction failed: {error.message}
            </div>
          )}

          {hash && !isConfirmed && (
            <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
              <p className="text-sm">Transaction submitted!</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm underline"
              >
                View on Etherscan <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleGrant}
              disabled={!isValidInput || isLoading}
              className="flex-1"
            >
              {isLoading && action === "grant" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Grant Access
            </Button>
            <Button
              onClick={handleRevoke}
              disabled={!isValidInput || isLoading}
              variant="destructive"
              className="flex-1"
            >
              {isLoading && action === "revoke" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserMinus className="mr-2 h-4 w-4" />
              )}
              Revoke Access
            </Button>
          </div>

          {isLoading && (
            <p className="text-muted-foreground text-center text-sm">
              {isPending
                ? "Confirm transaction in your wallet..."
                : "Waiting for confirmation..."}
            </p>
          )}

          {hash && (
            <Button variant="outline" onClick={handleClose} className="w-full">
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
