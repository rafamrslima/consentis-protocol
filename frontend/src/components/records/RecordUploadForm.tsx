"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRecordUpload, UploadStatus } from "@/hooks/useRecordUpload";

interface RecordUploadFormProps {
  patientAddress: string;
  onSuccess?: (cid: string) => void;
  onClose?: () => void;
}

export function RecordUploadForm({
  patientAddress,
  onSuccess,
  onClose,
}: RecordUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [recordName, setRecordName] = useState("");
  const { upload, status, error, reset } = useRecordUpload();

  const isLoading = status === "encrypting" || status === "uploading";
  const isDisabled = isLoading || status === "success";

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isDisabled,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !recordName.trim()) return;

    try {
      const cid = await upload(file, recordName.trim(), patientAddress);
      onSuccess?.(cid);
    } catch {}
  };

  const handleReset = () => {
    setFile(null);
    setRecordName("");
    reset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="recordName">Record Name</Label>
        <Input
          id="recordName"
          placeholder="e.g., Blood Work - January 2026"
          value={recordName}
          onChange={(e) => setRecordName(e.target.value)}
          disabled={isDisabled}
        />
      </div>

      <div className="space-y-2">
        <Label>File</Label>
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"} ${isDisabled ? "pointer-events-none opacity-50" : "hover:border-primary/50"} `}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <File className="h-5 w-5" />
              <span className="font-medium">{file.name}</span>
              <span className="text-muted-foreground text-sm">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="text-muted-foreground mx-auto h-8 w-8" />
              <p className="text-muted-foreground">
                {isDragActive
                  ? "Drop the file here"
                  : "Drag & drop a file, or click to select"}
              </p>
              <p className="text-muted-foreground text-xs">Max 10MB</p>
            </div>
          )}
        </div>
      </div>

      <StatusMessage status={status} error={error} />

      <div className="flex justify-end gap-3">
        {status === "success" ? (
          <>
            <Button type="button" variant="outline" onClick={handleReset}>
              Upload Another
            </Button>
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || !recordName.trim() || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {status === "encrypting"
                ? "Encrypting..."
                : status === "uploading"
                  ? "Uploading..."
                  : "Upload Record"}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}

function StatusMessage({
  status,
  error,
}: {
  status: UploadStatus;
  error: string | null;
}) {
  if (status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <span>Record uploaded and encrypted successfully!</span>
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600">
        <XCircle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  return null;
}
