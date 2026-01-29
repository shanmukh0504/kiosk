import { render, screen } from "../../../__tests__/test-utils";
import { ChainsTooltip } from "../ChainsTooltip";
import { formatChainDisplayName } from "../../../utils/utils";

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

// Mock utils
jest.mock("../../../utils/utils", () => ({
  formatChainDisplayName: jest.fn((chain: string) => `Formatted ${chain}`),
}));

describe("ChainsTooltip", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders formatted chain name", () => {
    render(<ChainsTooltip chain="ethereum" />);
    expect(screen.getByText("Formatted ethereum")).toBeInTheDocument();
  });

  it("calls formatChainDisplayName with correct chain", () => {
    render(<ChainsTooltip chain="bitcoin" />);
    expect(formatChainDisplayName).toHaveBeenCalledWith("bitcoin");
  });

  it("applies correct typography props", () => {
    render(<ChainsTooltip chain="ethereum" />);
    const typography = screen.getByTestId("typography");
    expect(typography).toHaveAttribute("data-size", "h5");
    expect(typography).toHaveAttribute("data-weight", "medium");
  });

  it("applies custom className when provided", () => {
    render(<ChainsTooltip chain="ethereum" className="custom-class" />);
    const tooltipContainer = screen.getByTestId("typography").parentElement;
    expect(tooltipContainer).toHaveClass("custom-class");
  });

  it("renders arrow indicator", () => {
    const { container } = render(<ChainsTooltip chain="ethereum" />);
    const arrow = container.querySelector(".rotate-45");
    expect(arrow).toBeInTheDocument();
  });

  it("applies correct container classes", () => {
    const { container } = render(<ChainsTooltip chain="ethereum" />);
    const containerElement = container.firstChild;
    expect(containerElement).toHaveClass(
      "absolute",
      "z-50",
      "mx-auto",
      "-mt-[84px]"
    );
  });
});
