import type { Record, AccessControlConditions, PatientRecord } from "@/types";

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

export interface CreateRecordRequest {
  name: string;
  patientAddress: string;
  dataToEncryptHash: string;
  accJson: AccessControlConditions[];
  encryptedFile: Blob;
}

export interface CreateRecordResponse {
  message: string;
  cid: string;
}

export async function createRecord(
  request: CreateRecordRequest
): Promise<CreateRecordResponse> {
  const formData = new FormData();
  formData.append("name", request.name);
  formData.append("patient_address", request.patientAddress);
  formData.append("data_to_encrypt_hash", request.dataToEncryptHash);
  formData.append("acc_json", JSON.stringify(request.accJson));
  formData.append("file", request.encryptedFile, "encrypted-record.bin");

  const response = await fetch(`${API_URL}/api/v1/records`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<CreateRecordResponse>(response);
}

export async function getEncryptedFile(cid: string): Promise<Blob> {
  const response = await fetch(`${API_URL}/api/v1/records/file/${cid}`);

  if (!response.ok) {
    const message = await response.text().catch(() => "Failed to fetch file");
    throw new ApiError(response.status, message);
  }

  return response.blob();
}

export async function getPatientRecords(
  patientAddress: string
): Promise<PatientRecord[]> {
  const response = await fetch(
    `${API_URL}/api/v1/records/patient/${patientAddress}`
  );

  return handleResponse<PatientRecord[]>(response);
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
