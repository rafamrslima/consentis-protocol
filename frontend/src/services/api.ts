import type {
  AccessControlConditions,
  PatientRecord,
  ResearcherRecord,
  ResearcherProfile,
  Record,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ||
  "https://orange-managerial-butterfly-780.mypinata.cloud/ipfs";

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
  recordId: string;
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
  formData.append("record_id", request.recordId);
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
  const response = await fetch(`${PINATA_GATEWAY}/${cid}`);

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
): Promise<ResearcherRecord[]> {
  const response = await fetch(
    `${API_URL}/api/v1/records/researcher/${researcherAddress}`
  );

  return handleResponse<ResearcherRecord[]>(response);
}

export interface ResearcherProfileResponse {
  id: string;
  full_name: string;
  institution: string;
  department: string;
  professional_email: string;
  credentials_url: string;
  bio: string;
  wallet_address: string;
}

export async function getResearcherProfileByAddress(
  address: string
): Promise<ResearcherProfileResponse | null> {
  const response = await fetch(`${API_URL}/api/v1/users/researcher/${address}`);

  if (response.status === 404) {
    return null;
  }

  return handleResponse<ResearcherProfileResponse>(response);
}

export async function createResearcherProfile(
  profile: ResearcherProfile
): Promise<string> {
  const response = await fetch(`${API_URL}/api/v1/users/researcher`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  return handleResponse<string>(response);
}
