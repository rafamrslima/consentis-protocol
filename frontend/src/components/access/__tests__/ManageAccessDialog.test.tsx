import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ManageAccessDialog } from "../ManageAccessDialog";

const mockGrantConsent = vi.fn();
const mockRevokeConsent = vi.fn();
const mockReset = vi.fn();
let mockIsPending = false;
let mockIsConfirmed = false;
let mockError: Error | null = null;
let mockHash: string | undefined = undefined;

vi.mock("@/hooks/useConsentRegistry", () => ({
  useConsentRegistry: () => ({
    grantConsent: mockGrantConsent,
    revokeConsent: mockRevokeConsent,
    isPending: mockIsPending,
    isConfirmed: mockIsConfirmed,
    error: mockError,
    hash: mockHash,
    reset: mockReset,
  }),
}));

describe("ManageAccessDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    recordId: "record-123",
    recordName: "Blood Work Results",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    mockIsConfirmed = false;
    mockError = null;
    mockHash = undefined;
  });

  describe("rendering", () => {
    it("renders dialog title", () => {
      render(<ManageAccessDialog {...defaultProps} />);
      expect(screen.getByText("Manage Access")).toBeInTheDocument();
    });

    it("renders record name in description", () => {
      render(<ManageAccessDialog {...defaultProps} />);
      expect(screen.getByText("Blood Work Results")).toBeInTheDocument();
    });

    it("renders researcher address input", () => {
      render(<ManageAccessDialog {...defaultProps} />);
      expect(screen.getByLabelText("Researcher Address")).toBeInTheDocument();
    });

    it("renders Grant Access button", () => {
      render(<ManageAccessDialog {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /Grant Access/ })
      ).toBeInTheDocument();
    });

    it("renders Revoke Access button", () => {
      render(<ManageAccessDialog {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /Revoke Access/ })
      ).toBeInTheDocument();
    });

    it("does not render when closed", () => {
      render(<ManageAccessDialog {...defaultProps} open={false} />);
      expect(screen.queryByText("Manage Access")).not.toBeInTheDocument();
    });
  });

  describe("address validation", () => {
    it("disables buttons when address is empty", () => {
      render(<ManageAccessDialog {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /Grant Access/ })
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /Revoke Access/ })
      ).toBeDisabled();
    });

    it("shows error for invalid address format", async () => {
      const user = userEvent.setup();
      render(<ManageAccessDialog {...defaultProps} />);

      await user.type(screen.getByLabelText("Researcher Address"), "invalid");

      expect(
        screen.getByText("Invalid Ethereum address format")
      ).toBeInTheDocument();
    });

    it("enables buttons with valid address", async () => {
      const user = userEvent.setup();
      render(<ManageAccessDialog {...defaultProps} />);

      await user.type(
        screen.getByLabelText("Researcher Address"),
        "0x1234567890123456789012345678901234567890"
      );

      expect(
        screen.getByRole("button", { name: /Grant Access/ })
      ).toBeEnabled();
      expect(
        screen.getByRole("button", { name: /Revoke Access/ })
      ).toBeEnabled();
    });

    it("does not show error for valid address", async () => {
      const user = userEvent.setup();
      render(<ManageAccessDialog {...defaultProps} />);

      await user.type(
        screen.getByLabelText("Researcher Address"),
        "0x1234567890123456789012345678901234567890"
      );

      expect(
        screen.queryByText("Invalid Ethereum address format")
      ).not.toBeInTheDocument();
    });
  });

  describe("grant consent", () => {
    it("calls grantConsent with correct parameters", async () => {
      const user = userEvent.setup();
      render(<ManageAccessDialog {...defaultProps} />);

      await user.type(
        screen.getByLabelText("Researcher Address"),
        "0x1234567890123456789012345678901234567890"
      );
      await user.click(screen.getByRole("button", { name: /Grant Access/ }));

      expect(mockGrantConsent).toHaveBeenCalledWith(
        "0x1234567890123456789012345678901234567890",
        "record-123"
      );
    });
  });

  describe("revoke consent", () => {
    it("calls revokeConsent with correct parameters", async () => {
      const user = userEvent.setup();
      render(<ManageAccessDialog {...defaultProps} />);

      await user.type(
        screen.getByLabelText("Researcher Address"),
        "0x1234567890123456789012345678901234567890"
      );
      await user.click(screen.getByRole("button", { name: /Revoke Access/ }));

      expect(mockRevokeConsent).toHaveBeenCalledWith(
        "0x1234567890123456789012345678901234567890",
        "record-123"
      );
    });
  });

  describe("loading state", () => {
    it("disables buttons when pending", () => {
      mockIsPending = true;
      render(<ManageAccessDialog {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Grant Access/ })
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /Revoke Access/ })
      ).toBeDisabled();
    });

    it("shows pending message when waiting for wallet", () => {
      mockIsPending = true;
      render(<ManageAccessDialog {...defaultProps} />);

      expect(
        screen.getByText(/Confirm transaction in your wallet/)
      ).toBeInTheDocument();
    });
  });

  describe("success state", () => {
    it("shows success message when confirmed", () => {
      mockIsConfirmed = true;
      render(<ManageAccessDialog {...defaultProps} />);

      expect(screen.getByText(/successfully/)).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows error message when transaction fails", () => {
      mockError = new Error("User rejected");
      render(<ManageAccessDialog {...defaultProps} />);

      expect(screen.getByText(/Transaction failed/)).toBeInTheDocument();
      expect(screen.getByText(/User rejected/)).toBeInTheDocument();
    });
  });

  describe("transaction hash", () => {
    it("shows etherscan link when hash available", () => {
      mockHash = "0xabcdef123456";
      render(<ManageAccessDialog {...defaultProps} />);

      const link = screen.getByRole("link", { name: /View on Etherscan/ });
      expect(link).toHaveAttribute(
        "href",
        "https://sepolia.etherscan.io/tx/0xabcdef123456"
      );
    });

    it("shows Close button when hash available", () => {
      mockHash = "0xabcdef123456";
      render(<ManageAccessDialog {...defaultProps} />);

      const closeButtons = screen.getAllByRole("button", { name: "Close" });
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
