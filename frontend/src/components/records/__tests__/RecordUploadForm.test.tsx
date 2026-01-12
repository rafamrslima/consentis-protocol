import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecordUploadForm } from "../RecordUploadForm";

const mockUpload = vi.fn();
const mockReset = vi.fn();
let mockStatus = "idle";
let mockError: string | null = null;

vi.mock("@/hooks/useRecordUpload", () => ({
  useRecordUpload: () => ({
    upload: mockUpload,
    status: mockStatus,
    error: mockError,
    reset: mockReset,
  }),
}));

describe("RecordUploadForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatus = "idle";
    mockError = null;
  });

  describe("rendering", () => {
    it("renders record name input", () => {
      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(screen.getByLabelText("Record Name")).toBeInTheDocument();
    });

    it("renders file dropzone", () => {
      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(
        screen.getByText(/Drag & drop a file, or click to select/)
      ).toBeInTheDocument();
    });

    it("renders max file size info", () => {
      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(screen.getByText("Max 10MB")).toBeInTheDocument();
    });

    it("renders Upload Record button", () => {
      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(
        screen.getByRole("button", { name: "Upload Record" })
      ).toBeInTheDocument();
    });

    it("renders Cancel button", () => {
      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
    });
  });

  describe("button state", () => {
    it("disables Upload Record button when no file selected", () => {
      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(
        screen.getByRole("button", { name: "Upload Record" })
      ).toBeDisabled();
    });

    it("disables Upload Record button when no record name", async () => {
      const user = userEvent.setup();
      render(<RecordUploadForm patientAddress="0xPatient" />);

      const input = screen.getByRole("textbox");
      await user.clear(input);

      expect(
        screen.getByRole("button", { name: "Upload Record" })
      ).toBeDisabled();
    });
  });

  describe("status messages", () => {
    it("shows encrypting status", () => {
      mockStatus = "encrypting";

      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(
        screen.getByRole("button", { name: /Encrypting/ })
      ).toBeInTheDocument();
    });

    it("shows uploading status", () => {
      mockStatus = "uploading";

      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(
        screen.getByRole("button", { name: /Uploading/ })
      ).toBeInTheDocument();
    });

    it("shows registering status", () => {
      mockStatus = "registering";

      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(
        screen.getByRole("button", { name: /Registering/ })
      ).toBeInTheDocument();
    });

    it("shows success message", () => {
      mockStatus = "success";

      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(
        screen.getByText(/Record uploaded and encrypted successfully/)
      ).toBeInTheDocument();
    });

    it("shows error message", () => {
      mockStatus = "error";
      mockError = "Upload failed. Please try again.";

      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(
        screen.getByText("Upload failed. Please try again.")
      ).toBeInTheDocument();
    });
  });

  describe("success state buttons", () => {
    beforeEach(() => {
      mockStatus = "success";
    });

    it("shows Upload Another button on success", () => {
      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(
        screen.getByRole("button", { name: "Upload Another" })
      ).toBeInTheDocument();
    });

    it("shows Done button on success", () => {
      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
    });

    it("calls onClose when Done is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<RecordUploadForm patientAddress="0xPatient" onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: "Done" }));

      expect(onClose).toHaveBeenCalled();
    });

    it("calls reset when Upload Another is clicked", async () => {
      const user = userEvent.setup();
      render(<RecordUploadForm patientAddress="0xPatient" />);

      await user.click(screen.getByRole("button", { name: "Upload Another" }));

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe("form interaction", () => {
    it("updates record name when typing", async () => {
      const user = userEvent.setup();
      render(<RecordUploadForm patientAddress="0xPatient" />);

      const input = screen.getByLabelText("Record Name");
      await user.type(input, "Test Record");

      expect(input).toHaveValue("Test Record");
    });

    it("renders dropzone input for file selection", () => {
      render(<RecordUploadForm patientAddress="0xPatient" />);
      const dropzone = screen.getByText(/Drag & drop a file/);
      expect(dropzone).toBeInTheDocument();
    });
  });

  describe("cancel button", () => {
    it("calls onClose when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<RecordUploadForm patientAddress="0xPatient" onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onClose).toHaveBeenCalled();
    });

    it("disables Cancel button when loading", () => {
      mockStatus = "encrypting";

      render(<RecordUploadForm patientAddress="0xPatient" />);
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });
  });
});
