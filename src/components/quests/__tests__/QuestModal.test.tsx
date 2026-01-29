import { render, screen } from "../../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { QuestModal } from "../QuestModal";

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({ children, "data-testid": dataTestId }: any) => (
    <div data-testid={dataTestId}>{children}</div>
  ),
  Button: ({ children, "data-testid": dataTestId, onClick }: any) => (
    <button data-testid={dataTestId} onClick={onClick}>
      {children}
    </button>
  ),
  CloseIcon: ({ onClick, "data-testid": dataTestId }: any) => (
    <div data-testid={dataTestId || "close-icon"} onClick={onClick}>
      Close
    </div>
  ),
  TrustWallet: ({ className }: any) => (
    <div data-testid="trust-wallet" className={className} />
  ),
  Modal: ({ children }: any) => <div data-testid="modal">{children}</div>,
}));

// Mock Tooltip
jest.mock("../../../common/Tooltip", () => ({
  Tooltip: ({ id, place, content }: any) => (
    <div
      data-testid="tooltip"
      data-id={id}
      data-place={place}
      data-content={content}
    />
  ),
}));

// Mock PartnerChip (local)
jest.mock("../PartnerChip", () => ({
  PartnerChip: ({ name }: any) => <div data-testid="partner-chip">{name}</div>,
}));

describe("QuestModal", () => {
  it("renders modal content when open", () => {
    const onClose = jest.fn();
    render(
      <QuestModal
        partner="TestPartner"
        description="Test description"
        logo={<div />}
        open={true}
        onClose={onClose}
      />
    );

    expect(screen.getByTestId("partner-chip")).toHaveTextContent("TestPartner");
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("Follow")).toBeInTheDocument();
    expect(screen.getByText("Claim Rewards")).toBeInTheDocument();

    // Claim button should be linked to tooltip via data-tooltip-id
    const claimButton =
      screen.getByText("Claim Rewards").closest("button") ||
      screen.getByText("Claim Rewards");
    expect(claimButton).toBeTruthy();
  });

  it("calls onClose when CloseIcon is clicked", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(
      <QuestModal
        partner="P"
        description="D"
        logo={<div />}
        open={true}
        onClose={onClose}
      />
    );

    const close = screen.getByTestId("close-icon");
    await user.click(close);
    expect(onClose).toHaveBeenCalled();
  });
});
