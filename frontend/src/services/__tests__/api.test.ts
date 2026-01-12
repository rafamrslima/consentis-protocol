import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import {
  createRecord,
  getEncryptedFile,
  getPatientRecords,
  getRecord,
  getResearcherRecords,
  getResearcherProfileByAddress,
  createResearcherProfile,
} from "../api";

const API_URL = "http://localhost:8080";
const PINATA_GATEWAY =
  "https://orange-managerial-butterfly-780.mypinata.cloud/ipfs";

const mockPatientRecord = {
  id: "record-1",
  name: "Blood Work - Dec 2025",
  ipfs_cid: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  data_to_encrypt_hash: "a1b2c3d4e5f6",
  patient_address: "0x1234567890123456789012345678901234567890",
  acc_json: "[]",
  created_at: "2025-12-15T10:30:00Z",
};

const mockResearcherRecord = {
  ...mockPatientRecord,
  consent_status: "granted",
};

const mockResearcherProfile = {
  id: "profile-1",
  full_name: "Dr. Jane Smith",
  institution: "Research University",
  department: "Medical Research",
  professional_email: "jane.smith@research.edu",
  credentials_url: "https://orcid.org/0000-0001-2345-6789",
  bio: "Researcher specializing in health data analytics",
  wallet_address: "0x0987654321098765432109876543210987654321",
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("API Service", () => {
  describe("createRecord", () => {
    it("creates a record successfully", async () => {
      server.use(
        http.post(`${API_URL}/api/v1/records`, async ({ request }) => {
          const formData = await request.formData();
          expect(formData.get("name")).toBe("Test Record");
          expect(formData.get("patient_address")).toBe("0x123");
          return HttpResponse.json({
            message: "Record created",
            cid: "QmTest",
          });
        })
      );

      const result = await createRecord({
        recordId: "rec-1",
        name: "Test Record",
        patientAddress: "0x123",
        dataToEncryptHash: "hash123",
        accJson: [],
        encryptedFile: new Blob(["test"]),
      });

      expect(result.message).toBe("Record created");
      expect(result.cid).toBe("QmTest");
    });

    it("throws ApiError on failure", async () => {
      server.use(
        http.post(`${API_URL}/api/v1/records`, () => {
          return new HttpResponse("Server error", { status: 500 });
        })
      );

      await expect(
        createRecord({
          recordId: "rec-1",
          name: "Test Record",
          patientAddress: "0x123",
          dataToEncryptHash: "hash123",
          accJson: [],
          encryptedFile: new Blob(["test"]),
        })
      ).rejects.toThrow("Server error");
    });
  });

  describe("getEncryptedFile", () => {
    it("fetches encrypted file from IPFS", async () => {
      const testContent = new Uint8Array([1, 2, 3, 4]);
      server.use(
        http.get(`${PINATA_GATEWAY}/QmTestCid`, () => {
          return new HttpResponse(testContent, {
            headers: { "Content-Type": "application/octet-stream" },
          });
        })
      );

      const blob = await getEncryptedFile("QmTestCid");
      expect(blob.size).toBeGreaterThan(0);
      expect(typeof blob.arrayBuffer).toBe("function");
    });

    it("throws ApiError when file not found", async () => {
      server.use(
        http.get(`${PINATA_GATEWAY}/QmNotFound`, () => {
          return new HttpResponse("Not found", { status: 404 });
        })
      );

      await expect(getEncryptedFile("QmNotFound")).rejects.toThrow("Not found");
    });
  });

  describe("getPatientRecords", () => {
    it("returns patient records array", async () => {
      server.use(
        http.get(`${API_URL}/api/v1/records/patient/:address`, () => {
          return HttpResponse.json([mockPatientRecord]);
        })
      );

      const records = await getPatientRecords("0x123");
      expect(records).toHaveLength(1);
      expect(records[0].name).toBe("Blood Work - Dec 2025");
    });

    it("returns empty array when no records", async () => {
      server.use(
        http.get(`${API_URL}/api/v1/records/patient/:address`, () => {
          return HttpResponse.json([]);
        })
      );

      const records = await getPatientRecords("0x123");
      expect(records).toEqual([]);
    });

    it("throws ApiError on server error", async () => {
      server.use(
        http.get(`${API_URL}/api/v1/records/patient/:address`, () => {
          return new HttpResponse("Internal server error", { status: 500 });
        })
      );

      await expect(getPatientRecords("0x123")).rejects.toThrow();
    });
  });

  describe("getRecord", () => {
    it("returns a single record", async () => {
      server.use(
        http.get(`${API_URL}/api/v1/records/:id`, () => {
          return HttpResponse.json(mockPatientRecord);
        })
      );

      const record = await getRecord("record-1");
      expect(record.id).toBe("record-1");
      expect(record.name).toBe("Blood Work - Dec 2025");
    });

    it("throws ApiError when record not found", async () => {
      server.use(
        http.get(`${API_URL}/api/v1/records/:id`, () => {
          return new HttpResponse("Record not found", { status: 404 });
        })
      );

      await expect(getRecord("not-found")).rejects.toThrow("Record not found");
    });
  });

  describe("getResearcherRecords", () => {
    it("returns researcher shared records", async () => {
      server.use(
        http.get(`${API_URL}/api/v1/records/researcher/:address`, () => {
          return HttpResponse.json([mockResearcherRecord]);
        })
      );

      const records = await getResearcherRecords("0x987");
      expect(records).toHaveLength(1);
      expect(records[0].consent_status).toBe("granted");
    });

    it("returns empty array when no shared records", async () => {
      server.use(
        http.get(`${API_URL}/api/v1/records/researcher/:address`, () => {
          return HttpResponse.json([]);
        })
      );

      const records = await getResearcherRecords("0x987");
      expect(records).toEqual([]);
    });
  });

  describe("getResearcherProfileByAddress", () => {
    it("returns researcher profile when found", async () => {
      server.use(
        http.get(`${API_URL}/api/v1/users/researcher/:address`, () => {
          return HttpResponse.json(mockResearcherProfile);
        })
      );

      const profile = await getResearcherProfileByAddress("0x987");
      expect(profile).not.toBeNull();
      expect(profile?.full_name).toBe("Dr. Jane Smith");
      expect(profile?.institution).toBe("Research University");
    });

    it("returns null when profile not found (404)", async () => {
      server.use(
        http.get(`${API_URL}/api/v1/users/researcher/:address`, () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      const profile = await getResearcherProfileByAddress("0x000");
      expect(profile).toBeNull();
    });

    it("throws ApiError on other errors", async () => {
      server.use(
        http.get(`${API_URL}/api/v1/users/researcher/:address`, () => {
          return new HttpResponse("Server error", { status: 500 });
        })
      );

      await expect(getResearcherProfileByAddress("0x123")).rejects.toThrow();
    });
  });

  describe("createResearcherProfile", () => {
    it("creates profile and returns id", async () => {
      server.use(
        http.post(`${API_URL}/api/v1/users/researcher`, async ({ request }) => {
          const body = await request.json();
          expect(body).toHaveProperty("full_name");
          return HttpResponse.json("new-profile-id");
        })
      );

      const result = await createResearcherProfile({
        full_name: "Dr. Test",
        institution: "Test University",
        department: "Research",
        professional_email: "test@test.edu",
        credentials_url: "",
        bio: "",
        wallet_address: "0x123",
      });

      expect(result).toBe("new-profile-id");
    });

    it("throws ApiError on validation error", async () => {
      server.use(
        http.post(`${API_URL}/api/v1/users/researcher`, () => {
          return new HttpResponse("Validation failed", { status: 400 });
        })
      );

      await expect(
        createResearcherProfile({
          full_name: "",
          institution: "",
          department: "",
          professional_email: "",
          credentials_url: "",
          bio: "",
          wallet_address: "",
        })
      ).rejects.toThrow("Validation failed");
    });
  });
});
