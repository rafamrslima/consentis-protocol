import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResearcherRecordsList } from "../ResearcherRecordsList";
import type { ResearcherRecord } from "@/types";

let mockDecryptStatus = "idle";
const mockDecrypt = vi.fn();

vi.mock("@/hooks/useDecrypt", () => ({
  useDecrypt: () => ({
    decrypt: mockDecrypt,
    status: mockDecryptStatus,
  }),
}));

const createMockRecord = (
  overrides: Partial<ResearcherRecord> = {}
): ResearcherRecord => ({
  id: "record-1",
  name: "Blood Work - Jan 2026",
  ipfs_cid: "QmTestCidLongEnoughToTruncate1234567890",
  data_to_encrypt_hash: "hash123",
  patient_address: "0x1234567890abcdef1234567890abcdef12345678",
  acc_json: [],
  created_at: "2026-01-15T10:30:00Z",
  consent_status: "granted",
  last_updated_consent: "2026-01-15T10:30:00Z",
  ...overrides,
});

describe("ResearcherRecordsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDecryptStatus = "idle";
  });

  describe("loading state", () => {
    it("renders table when loading", () => {
      render(<ResearcherRecordsList records={[]} isLoading={true} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("shows table headers when loading", () => {
      render(<ResearcherRecordsList records={[]} isLoading={true} />);
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Patient")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty message when no records", () => {
      render(<ResearcherRecordsList records={[]} isLoading={false} />);
      expect(
        screen.getByText("No shared records available.")
      ).toBeInTheDocument();
    });

    it("shows helpful text in empty state", () => {
      render(<ResearcherRecordsList records={[]} isLoading={false} />);
      expect(
        screen.getByText(
          /Records will appear here when patients grant you access/
        )
      ).toBeInTheDocument();
    });
  });

  describe("records table", () => {
    it("renders table with records", () => {
      const records = [createMockRecord()];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("shows record name", () => {
      const records = [createMockRecord({ name: "MRI Results" })];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      expect(screen.getByText("MRI Results")).toBeInTheDocument();
    });

    it("shows truncated patient address", () => {
      const records = [createMockRecord()];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      expect(screen.getByText("0x1234...5678")).toBeInTheDocument();
    });

    it("shows truncated IPFS CID with link", () => {
      const records = [createMockRecord()];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute(
        "href",
        expect.stringContaining("gateway.pinata.cloud/ipfs/")
      );
    });

    it("renders multiple records", () => {
      const records = [
        createMockRecord({ id: "1", name: "Record 1" }),
        createMockRecord({ id: "2", name: "Record 2" }),
      ];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      expect(screen.getByText("Record 1")).toBeInTheDocument();
      expect(screen.getByText("Record 2")).toBeInTheDocument();
    });
  });

  describe("consent badges", () => {
    it("shows Granted badge when consent granted", () => {
      const records = [createMockRecord({ consent_status: "granted" })];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      expect(screen.getByText("Granted")).toBeInTheDocument();
    });

    it("shows Revoked badge when consent revoked", () => {
      const records = [createMockRecord({ consent_status: "revoked" })];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      expect(screen.getByText("Revoked")).toBeInTheDocument();
    });

    it("shows No Access badge for unknown status", () => {
      const records = [createMockRecord({ consent_status: "unknown" })];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      expect(screen.getByText("No Access")).toBeInTheDocument();
    });
  });

  describe("download button", () => {
    it("renders Download button for each record", () => {
      const records = [createMockRecord()];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      expect(
        screen.getByRole("button", { name: /Download/ })
      ).toBeInTheDocument();
    });

    it("enables Download button when consent granted", () => {
      const records = [createMockRecord({ consent_status: "granted" })];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      expect(screen.getByRole("button", { name: /Download/ })).toBeEnabled();
    });

    it("disables Download button when consent revoked", () => {
      const records = [createMockRecord({ consent_status: "revoked" })];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      expect(screen.getByRole("button", { name: /Download/ })).toBeDisabled();
    });

    it("disables Download button when no access", () => {
      const records = [createMockRecord({ consent_status: "unknown" })];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      expect(screen.getByRole("button", { name: /Download/ })).toBeDisabled();
    });

    it("calls decrypt when Download button clicked", async () => {
      const user = userEvent.setup();
      mockDecrypt.mockResolvedValue(
        new File(["test"], "test.pdf", { type: "application/pdf" })
      );

      const records = [createMockRecord()];
      render(<ResearcherRecordsList records={records} isLoading={false} />);

      await user.click(screen.getByRole("button", { name: /Download/ }));

      expect(mockDecrypt).toHaveBeenCalledWith(records[0]);
    });
  });

  describe("table headers", () => {
    it("shows all column headers", () => {
      const records = [createMockRecord()];
      render(<ResearcherRecordsList records={records} isLoading={false} />);
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Patient")).toBeInTheDocument();
      expect(screen.getByText("IPFS CID")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Created")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });
});
