import { render, screen } from "../../../__tests__/test-utils";
import { RateAndPriceDisplay } from "../RateAndPriceDisplay";

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({
    children,
    "data-testid": dataTestId,
    className,
  }: {
    children: React.ReactNode;
    "data-testid"?: string;
    className?: string;
  }) => (
    <div data-testid={dataTestId} className={className}>
      {children}
    </div>
  ),
  SwapHorizontalIcon: ({ className }: { className?: string }) => (
    <div data-testid="swap-horizontal-icon" className={className}>
      SwapHorizontalIcon
    </div>
  ),
}));

describe("RateAndPriceDisplay", () => {
  it("renders with input and output tokens", () => {
    render(
      <RateAndPriceDisplay inputToken="BTC" outputToken="ETH" rate="0.05" />
    );
    expect(screen.getByText("1 BTC")).toBeInTheDocument();
    expect(screen.getByText("ETH")).toBeInTheDocument();
    expect(screen.getByTestId("rate-price-display-value")).toHaveTextContent(
      "0.05"
    );
  });

  it("renders swap icon when no tokenPrice is provided", () => {
    render(
      <RateAndPriceDisplay inputToken="BTC" outputToken="ETH" rate="0.05" />
    );
    expect(screen.getByTestId("swap-horizontal-icon")).toBeInTheDocument();
  });

  it("renders token price when provided", () => {
    render(<RateAndPriceDisplay inputToken="BTC" tokenPrice="50000" />);
    expect(screen.getByText("≈")).toBeInTheDocument();
    expect(screen.getByTestId("rate-price-display-value")).toHaveTextContent(
      "$50000"
    );
  });

  it("shows loading state when isLoading is true", () => {
    const { container } = render(
      <RateAndPriceDisplay
        inputToken="BTC"
        outputToken="ETH"
        isLoading={true}
      />
    );
    const loadingElement = container.querySelector(".animate-pulse");
    expect(loadingElement).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <RateAndPriceDisplay
        inputToken="BTC"
        outputToken="ETH"
        className="custom-class"
      />
    );
    const display = screen.getByTestId("rate-price-display");
    expect(display).toBeInTheDocument();
  });

  it("renders without output token when only rate is provided", () => {
    render(<RateAndPriceDisplay inputToken="BTC" rate="0.05" />);
    expect(screen.getByText("1 BTC")).toBeInTheDocument();
    expect(screen.queryByText("ETH")).not.toBeInTheDocument();
  });

  it("handles numeric rate values", () => {
    render(
      <RateAndPriceDisplay inputToken="BTC" outputToken="ETH" rate={0.05} />
    );
    expect(screen.getByTestId("rate-price-display-value")).toHaveTextContent(
      "0.05"
    );
  });

  it("handles numeric tokenPrice values", () => {
    render(<RateAndPriceDisplay inputToken="BTC" tokenPrice={50000} />);
    expect(screen.getByTestId("rate-price-display-value")).toHaveTextContent(
      "$50000"
    );
  });
});
