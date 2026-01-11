import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoleSelector } from "../RoleSelector";

describe("RoleSelector", () => {
  describe("rendering", () => {
    it("renders the title", () => {
      render(<RoleSelector onSelect={vi.fn()} />);
      expect(screen.getByText("Select Your Role")).toBeInTheDocument();
    });

    it("renders the subtitle", () => {
      render(<RoleSelector onSelect={vi.fn()} />);
      expect(
        screen.getByText("Choose how you want to use Consentis Protocol")
      ).toBeInTheDocument();
    });

    it("renders Patient role option", () => {
      render(<RoleSelector onSelect={vi.fn()} />);
      expect(screen.getByText("Patient")).toBeInTheDocument();
      expect(
        screen.getByText(/Upload and manage your medical records/)
      ).toBeInTheDocument();
    });

    it("renders Researcher role option", () => {
      render(<RoleSelector onSelect={vi.fn()} />);
      expect(screen.getByText("Researcher")).toBeInTheDocument();
      expect(
        screen.getByText(/Access shared medical records for research purposes/)
      ).toBeInTheDocument();
    });

    it("renders Continue button", () => {
      render(<RoleSelector onSelect={vi.fn()} />);
      expect(
        screen.getByRole("button", { name: "Continue" })
      ).toBeInTheDocument();
    });
  });

  describe("button state", () => {
    it("disables Continue button when no role is selected", () => {
      render(<RoleSelector onSelect={vi.fn()} />);
      expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    });

    it("enables Continue button when a role is selected", async () => {
      const user = userEvent.setup();
      render(<RoleSelector onSelect={vi.fn()} />);

      await user.click(screen.getByText("Patient"));

      expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    });

    it("disables Continue button when isLoading is true", async () => {
      const user = userEvent.setup();
      render(<RoleSelector onSelect={vi.fn()} isLoading={true} />);

      await user.click(screen.getByText("Patient"));

      expect(
        screen.getByRole("button", { name: "Confirming..." })
      ).toBeDisabled();
    });

    it("shows Confirming... text when isLoading", () => {
      render(<RoleSelector onSelect={vi.fn()} isLoading={true} />);
      expect(
        screen.getByRole("button", { name: "Confirming..." })
      ).toBeInTheDocument();
    });
  });

  describe("role selection", () => {
    it("calls onSelect with patient when Patient is selected and confirmed", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<RoleSelector onSelect={onSelect} />);

      await user.click(screen.getByText("Patient"));
      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(onSelect).toHaveBeenCalledWith("patient");
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("calls onSelect with researcher when Researcher is selected and confirmed", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<RoleSelector onSelect={onSelect} />);

      await user.click(screen.getByText("Researcher"));
      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(onSelect).toHaveBeenCalledWith("researcher");
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("does not call onSelect when Continue is clicked without selection", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<RoleSelector onSelect={onSelect} />);

      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it("allows changing selection before confirming", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<RoleSelector onSelect={onSelect} />);

      await user.click(screen.getByText("Patient"));
      await user.click(screen.getByText("Researcher"));
      await user.click(screen.getByRole("button", { name: "Continue" }));

      expect(onSelect).toHaveBeenCalledWith("researcher");
    });
  });
});
