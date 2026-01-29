import { render, screen } from "../../../__tests__/test-utils";
import { PartnerChip } from "../PartnerChip";

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
      Logo: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="chip-logo">{children}</div>
      ),
      CheckBox: ({ checked }: { checked: boolean }) => (
        <div data-testid="chip-checkbox" data-checked={checked.toString()}>
          CheckBox
        </div>
      ),
    }
  ),
}));

describe("PartnerChip", () => {
  const mockLogo = <div data-testid="partner-logo">Logo</div>;

  it("renders partner name", () => {
    render(<PartnerChip name="Test Partner" logo={mockLogo} />);
    expect(screen.getByText("Test Partner")).toBeInTheDocument();
  });

  it("renders partner logo", () => {
    render(<PartnerChip name="Test Partner" logo={mockLogo} />);
    expect(screen.getByTestId("partner-logo")).toBeInTheDocument();
  });

  it("renders checked checkbox", () => {
    render(<PartnerChip name="Test Partner" logo={mockLogo} />);
    const checkbox = screen.getByTestId("chip-checkbox");
    expect(checkbox).toHaveAttribute("data-checked", "true");
  });

  it("applies correct className to chip", () => {
    render(<PartnerChip name="Test Partner" logo={mockLogo} />);
    const chip = screen.getByTestId("chip");
    expect(chip).toHaveClass("bg-white/50", "px-2", "py-1.5");
  });

  it("renders with different partner names", () => {
    const { rerender } = render(
      <PartnerChip name="Partner 1" logo={mockLogo} />
    );
    expect(screen.getByText("Partner 1")).toBeInTheDocument();

    rerender(<PartnerChip name="Partner 2" logo={mockLogo} />);
    expect(screen.getByText("Partner 2")).toBeInTheDocument();
  });

  it("renders with different logo components", () => {
    const logo1 = <div data-testid="logo-1">Logo 1</div>;
    const logo2 = <img data-testid="logo-2" src="logo.png" alt="Logo" />;

    const { rerender } = render(<PartnerChip name="Partner" logo={logo1} />);
    expect(screen.getByTestId("logo-1")).toBeInTheDocument();

    rerender(<PartnerChip name="Partner" logo={logo2} />);
    expect(screen.getByTestId("logo-2")).toBeInTheDocument();
  });
});
