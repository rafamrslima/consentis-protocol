import type { Record, RecordDTO } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text().catch(() => "Request failed");
    throw new ApiError(response.status, message);
  }
  return response.json();
}

export interface UploadResponse {
  cid: string;
}

export async function uploadEncryptedFile(blob: Blob): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", blob, "encrypted-record");

  const response = await fetch(`${API_URL}/api/v1/records/upload`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<UploadResponse>(response);
}

export async function getEncryptedFile(cid: string): Promise<Blob> {
  const response = await fetch(`${API_URL}/api/v1/records/file/${cid}`);

  if (!response.ok) {
    const message = await response.text().catch(() => "Failed to fetch file");
    throw new ApiError(response.status, message);
  }

  return response.blob();
}

export interface CreateRecordResponse {
  id: string;
  message: string;
}

export async function createRecord(
  record: RecordDTO
): Promise<CreateRecordResponse> {
  const response = await fetch(`${API_URL}/api/v1/records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });

  return handleResponse<CreateRecordResponse>(response);
}

export async function getPatientRecords(
  patientAddress: string
): Promise<Record[]> {
  const response = await fetch(
    `${API_URL}/api/v1/records/patient/${patientAddress}`
  );

  return handleResponse<Record[]>(response);
}

export async function getRecord(id: string): Promise<Record> {
  const response = await fetch(`${API_URL}/api/v1/records/${id}`);

  return handleResponse<Record>(response);
}

export async function getResearcherRecords(
  researcherAddress: string
): Promise<Record[]> {
  const response = await fetch(
    `${API_URL}/api/v1/records/researcher/${researcherAddress}`
  );

  return handleResponse<Record[]>(response);
}
