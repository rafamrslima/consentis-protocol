import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecordsList } from "../RecordsList";
import type { PatientRecord } from "@/types";

let mockDecryptStatus = "idle";
const mockDecrypt = vi.fn();

vi.mock("@/hooks/useDecrypt", () => ({
  useDecrypt: () => ({
    decrypt: mockDecrypt,
    status: mockDecryptStatus,
  }),
}));

vi.mock("@/components/access/ManageAccessDialog", () => ({
  ManageAccessDialog: ({
    open,
    recordName,
  }: {
    open: boolean;
    recordName: string;
  }) =>
    open ? <div data-testid="manage-access-dialog">{recordName}</div> : null,
}));

const createMockRecord = (
  overrides: Partial<PatientRecord> = {}
): PatientRecord => ({
  id: "record-1",
  name: "Blood Work - Jan 2026",
  ipfs_cid: "QmTestCid",
  data_to_encrypt_hash: "hash123",
  patient_address: "0xPatient",
  acc_json: [],
  created_at: "2026-01-15T10:30:00Z",
  updated_at: "2026-01-15T10:30:00Z",
  ...overrides,
});

describe("RecordsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDecryptStatus = "idle";
  });

  describe("loading state", () => {
    it("renders skeleton when loading", () => {
      render(<RecordsList records={[]} isLoading={true} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("shows table structure when loading", () => {
      render(<RecordsList records={[]} isLoading={true} />);
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Created")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty message when no records", () => {
      render(<RecordsList records={[]} isLoading={false} />);
      expect(
        screen.getByText(/No records yet. Upload your first health record/)
      ).toBeInTheDocument();
    });
  });

  describe("records table", () => {
    it("renders table with records", () => {
      const records = [createMockRecord()];
      render(<RecordsList records={records} isLoading={false} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("shows record name", () => {
      const records = [createMockRecord({ name: "MRI Results" })];
      render(<RecordsList records={records} isLoading={false} />);
      expect(screen.getByText("MRI Results")).toBeInTheDocument();
    });

    it("shows formatted date", () => {
      const records = [createMockRecord()];
      render(<RecordsList records={records} isLoading={false} />);
      expect(screen.getByText(/Jan 15, 2026/)).toBeInTheDocument();
    });

    it("renders multiple records", () => {
      const records = [
        createMockRecord({ id: "1", name: "Record 1" }),
        createMockRecord({ id: "2", name: "Record 2" }),
        createMockRecord({ id: "3", name: "Record 3" }),
      ];
      render(<RecordsList records={records} isLoading={false} />);
      expect(screen.getByText("Record 1")).toBeInTheDocument();
      expect(screen.getByText("Record 2")).toBeInTheDocument();
      expect(screen.getByText("Record 3")).toBeInTheDocument();
    });
  });

  describe("action buttons", () => {
    it("renders View button for each record", () => {
      const records = [createMockRecord()];
      render(<RecordsList records={records} isLoading={false} />);
      expect(screen.getByRole("button", { name: /View/ })).toBeInTheDocument();
    });

    it("renders Access button for each record", () => {
      const records = [createMockRecord()];
      render(<RecordsList records={records} isLoading={false} />);
      expect(
        screen.getByRole("button", { name: /Access/ })
      ).toBeInTheDocument();
    });

    it("opens ManageAccessDialog when Access button clicked", async () => {
      const user = userEvent.setup();
      const records = [createMockRecord({ name: "My Record" })];
      render(<RecordsList records={records} isLoading={false} />);

      await user.click(screen.getByRole("button", { name: /Access/ }));

      expect(screen.getByTestId("manage-access-dialog")).toBeInTheDocument();
    });
  });

  describe("download functionality", () => {
    it("calls decrypt when View button is clicked", async () => {
      const user = userEvent.setup();
      mockDecrypt.mockResolvedValue(
        new File(["test"], "test.pdf", { type: "application/pdf" })
      );

      const records = [createMockRecord()];
      render(<RecordsList records={records} isLoading={false} />);

      await user.click(screen.getByRole("button", { name: /View/ }));

      expect(mockDecrypt).toHaveBeenCalledWith(records[0]);
    });
  });

  describe("table headers", () => {
    it("shows Name column header", () => {
      const records = [createMockRecord()];
      render(<RecordsList records={records} isLoading={false} />);
      expect(screen.getByText("Name")).toBeInTheDocument();
    });

    it("shows Created column header", () => {
      const records = [createMockRecord()];
      render(<RecordsList records={records} isLoading={false} />);
      expect(screen.getByText("Created")).toBeInTheDocument();
    });

    it("shows Actions column header", () => {
      const records = [createMockRecord()];
      render(<RecordsList records={records} isLoading={false} />);
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });
});
