import { http, HttpResponse } from "msw";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const mockPatientRecord = {
  id: "record-1",
  name: "Blood Work - Dec 2025",
  ipfs_cid: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  data_to_encrypt_hash: "a1b2c3d4e5f6",
  patient_address: "0x1234567890123456789012345678901234567890",
  acc_json: JSON.stringify([
    {
      contractAddress: "0xContractAddress",
      standardContractType: "",
      chain: "sepolia",
      method: "hasConsent",
      parameters: [":userAddress", "record-1", "0xPatientAddress"],
      returnValueTest: {
        comparator: "=",
        value: "true",
      },
    },
  ]),
  created_at: "2025-12-15T10:30:00Z",
};

export const mockResearcherRecord = {
  ...mockPatientRecord,
  consent_status: "granted",
};

export const mockResearcherProfile = {
  id: "profile-1",
  wallet_address: "0x0987654321098765432109876543210987654321",
  name: "Dr. Jane Smith",
  institution: "Research University",
  department: "Medical Research",
  email: "jane.smith@research.edu",
  credentials_url: "https://orcid.org/0000-0001-2345-6789",
  bio: "Researcher specializing in health data analytics",
  created_at: "2025-11-01T08:00:00Z",
};

export const handlers = [
  http.get(`${API_BASE}/api/v1/records/patient/:address`, () => {
    return HttpResponse.json([mockPatientRecord]);
  }),

  http.get(`${API_BASE}/api/v1/records/researcher/:address`, () => {
    return HttpResponse.json([mockResearcherRecord]);
  }),

  http.get(`${API_BASE}/api/v1/records/:id`, ({ params }) => {
    if (params.id === "not-found") {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(mockPatientRecord);
  }),

  http.post(`${API_BASE}/api/v1/records`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockPatientRecord,
      ...(body as object),
      id: "new-record-id",
    });
  }),

  http.get(`${API_BASE}/api/v1/users/researcher/:address`, ({ params }) => {
    if (params.address === "0x0000000000000000000000000000000000000000") {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(mockResearcherProfile);
  }),

  http.post(`${API_BASE}/api/v1/users/researcher`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockResearcherProfile,
      ...(body as object),
      id: "new-profile-id",
    });
  }),
];

export const errorHandlers = [
  http.get(`${API_BASE}/api/v1/records/patient/:address`, () => {
    return new HttpResponse(null, { status: 500 });
  }),

  http.get(`${API_BASE}/api/v1/records/researcher/:address`, () => {
    return new HttpResponse(null, { status: 500 });
  }),
];
