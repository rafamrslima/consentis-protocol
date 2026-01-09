export type UserRole = "patient" | "researcher";

export type ProfileStatus = "unknown" | "checking" | "complete" | "incomplete";

export interface ResearcherProfile {
  full_name: string;
  institution: string;
  department?: string;
  professional_email: string;
  credentials_url?: string;
  bio?: string;
  wallet_address: string;
}

export interface User {
  id: string;
  walletAddress: string;
  role: UserRole;
  createdAt: Date;
}

export interface Record {
  id: string;
  patientId: string;
  name: string;
  ipfsCid: string;
  dataToEncryptHash: string;
  accJson: AccessControlConditions;
  createdAt: Date;
}

export interface PatientRecord {
  id: string;
  name: string;
  ipfs_cid: string;
  data_to_encrypt_hash: string;
  acc_json: AccessControlConditions[];
  patient_address: string;
  created_at: string;
}

export interface ResearcherRecord {
  id: string;
  name: string;
  ipfs_cid: string;
  data_to_encrypt_hash: string;
  acc_json: AccessControlConditions[];
  patient_address: string;
  created_at: string;
  consent_status: string;
  last_updated_consent: string | null;
}

export interface AccessControlConditions {
  contractAddress: string;
  chain: string;
  method: string;
  parameters: string[];
  returnValueTest: {
    comparator: string;
    value: string;
  };
}

export interface AccessGrant {
  recordId: string;
  researcherAddress: string;
  grantedAt: Date;
}
