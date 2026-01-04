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
