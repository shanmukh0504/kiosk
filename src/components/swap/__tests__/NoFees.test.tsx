import { render, screen } from "../../../__tests__/test-utils";
import { NoFees } from "../NoFees";

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({
    children,
    size,
    weight,
    className,
  }: {
    children: React.ReactNode;
    size?: string;
    weight?: string;
    className?: string;
  }) => (
    <div
      data-testid="typography"
      data-size={size}
      data-weight={weight}
      className={className}
    >
      {children}
    </div>
  ),
}));

describe("NoFees", () => {
  it('renders "No Fees" text', () => {
    render(<NoFees />);
    expect(screen.getByText("No Fees")).toBeInTheDocument();
  });

  it("applies correct typography props", () => {
    render(<NoFees />);
    const typography = screen.getByTestId("typography");
    expect(typography).toHaveAttribute("data-size", "h5");
    expect(typography).toHaveAttribute("data-weight", "medium");
  });

  it("applies correct className", () => {
    render(<NoFees />);
    const typography = screen.getByTestId("typography");
    expect(typography).toHaveClass(
      "rounded-full",
      "bg-[#E8FCF6]",
      "px-2",
      "py-1",
      "!text-[#2CC994]"
    );
  });
});
