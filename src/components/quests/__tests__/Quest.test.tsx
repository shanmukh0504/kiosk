import { render, screen } from "../../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { Quest } from "../Quest";

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="typography">{children}</div>
  ),
  Chip: Object.assign(
    ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <div data-testid="chip" className={className}>
        {children}
      </div>
    ),
    {
      CheckBox: ({ checked }: { checked: boolean }) => (
        <div data-testid="chip-checkbox" data-checked={checked.toString()}>
          CheckBox
        </div>
      ),
    }
  ),
  ArrowNorthEastIcon: ({ className }: { className?: string }) => (
    <div data-testid="arrow-icon" className={className}>
      ArrowNorthEastIcon
    </div>
  ),
  OpenInFullIcon: ({
    className,
    onClick,
  }: {
    className?: string;
    onClick?: () => void;
  }) => (
    <div data-testid="open-full-icon" className={className} onClick={onClick}>
      OpenInFullIcon
    </div>
  ),
}));

// Mock PartnerChip
jest.mock("../PartnerChip", () => ({
  PartnerChip: ({ name, logo }: { name: string; logo: React.ReactNode }) => (
    <div data-testid="partner-chip" data-name={name}>
      {logo}
    </div>
  ),
}));

describe("Quest", () => {
  const mockLogo = <div data-testid="quest-logo">Logo</div>;
  const defaultProps = {
    partner: "Test Partner",
    description: "Test quest description",
    logo: mockLogo,
    amount: 100,
    logoLink: "/partner-link",
  };

  it("renders partner chip with correct name", () => {
    render(<Quest {...defaultProps} />);
    const partnerChip = screen.getByTestId("partner-chip");
    expect(partnerChip).toHaveAttribute("data-name", "Test Partner");
  });

  it("renders description", () => {
    render(<Quest {...defaultProps} />);
    expect(screen.getByText("Test quest description")).toBeInTheDocument();
  });

  it("renders amount in SEED chip", () => {
    render(<Quest {...defaultProps} />);
    expect(screen.getByText("100 SEED")).toBeInTheDocument();
  });

  it("renders unchecked checkbox", () => {
    render(<Quest {...defaultProps} />);
    const checkbox = screen.getByTestId("chip-checkbox");
    expect(checkbox).toHaveAttribute("data-checked", "false");
  });

  it("renders arrow icon when link is provided and no showModal", () => {
    render(<Quest {...defaultProps} link="/quest-link" />);
    expect(screen.getByTestId("arrow-icon")).toBeInTheDocument();
  });

  it("renders open full icon when showModal is provided", async () => {
    const mockShowModal = jest.fn();
    const user = userEvent.setup();
    render(<Quest {...defaultProps} showModal={mockShowModal} />);

    const openFullIcon = screen.getByTestId("open-full-icon");
    expect(openFullIcon).toBeInTheDocument();

    await user.click(openFullIcon);
    expect(mockShowModal).toHaveBeenCalled();
  });

  it("applies featured className when featured is true", () => {
    const { container } = render(<Quest {...defaultProps} featured />);
    const questContainer = container.firstChild;
    expect(questContainer).toHaveClass(
      "lg:shrink-0",
      "lg:grow-0",
      "lg:basis-2/3"
    );
  });

  it("does not apply featured className when featured is false", () => {
    const { container } = render(<Quest {...defaultProps} featured={false} />);
    const questContainer = container.firstChild;
    expect(questContainer).not.toHaveClass(
      "lg:shrink-0",
      "lg:grow-0",
      "lg:basis-2/3"
    );
  });

  it("renders logo link correctly", () => {
    render(<Quest {...defaultProps} />);
    // Find link by href since PartnerChip is inside the Link
    const logoLinks = screen.getAllByRole("link");
    const logoLink = logoLinks.find(
      (link) => link.getAttribute("href") === "/partner-link"
    );
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute("target", "_blank");
  });
});
