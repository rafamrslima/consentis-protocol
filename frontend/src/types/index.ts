export type UserRole = "patient" | "researcher";

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

export interface RecordDTO {
  name: string;
  ipfs_cid: string;
  data_to_encrypt_hash: string;
  patient_address: string;
  acc_json: string;
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
