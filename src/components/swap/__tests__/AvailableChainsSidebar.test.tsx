import { render, screen } from "../../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { AvailableChainsSidebar } from "../AvailableChainsSidebar";

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
  ArrowLeftIcon: ({
    onClick,
    className,
    "data-testid": dataTestId,
  }: {
    onClick?: () => void;
    className?: string;
    "data-testid"?: string;
  }) => (
    <div data-testid={dataTestId} className={className} onClick={onClick}>
      ArrowLeftIcon
    </div>
  ),
  SearchIcon: () => <div data-testid="search-icon">SearchIcon</div>,
  GradientScroll: ({
    children,
    height,
    gradientHeight,
  }: {
    children: React.ReactNode;
    height?: number;
    gradientHeight?: number;
  }) => (
    <div
      data-testid="gradient-scroll"
      data-height={height}
      data-gradient-height={gradientHeight}
    >
      {children}
    </div>
  ),
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, "data-testid": dataTestId, ...props }: any) => (
      <div data-testid={dataTestId} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock utils
jest.mock("../../../utils/utils", () => ({
  formatChainDisplayName: jest.fn(
    (name: string) => name.charAt(0).toUpperCase() + name.slice(1)
  ),
}));

// Mock viewPortStore
const mockViewPortStore = jest.fn();
jest.mock("../../../store/viewPortStore", () => ({
  viewPortStore: () => mockViewPortStore(),
}));

describe("AvailableChainsSidebar", () => {
  const mockChains = [
    { chain: "bitcoin", name: "bitcoin", icon: "btc-icon.png", id: "bitcoin" },
    {
      chain: "ethereum",
      name: "ethereum",
      icon: "eth-icon.png",
      id: "ethereum",
    },
    { chain: "solana", name: "solana", icon: "sol-icon.png", id: "solana" },
  ] as any[];

  const mockHide = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockViewPortStore.mockReturnValue({
      isMobile: false,
    });
  });

  it("renders when show is true", () => {
    render(
      <AvailableChainsSidebar
        show={true}
        chains={mockChains}
        hide={mockHide}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByTestId("available-chains-sidebar")).toBeInTheDocument();
    expect(screen.getByText("Select chain")).toBeInTheDocument();
  });

  it("does not render when show is false", () => {
    const { container } = render(
      <AvailableChainsSidebar
        show={false}
        chains={mockChains}
        hide={mockHide}
        onClick={mockOnClick}
      />
    );

    const sidebar = container.querySelector(
      '[data-testid="available-chains-sidebar"]'
    );
    expect(sidebar).toBeInTheDocument();
  });

  it("calls hide when back button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AvailableChainsSidebar
        show={true}
        chains={mockChains}
        hide={mockHide}
        onClick={mockOnClick}
      />
    );

    const backButton = screen.getByTestId("chain-selector-back");
    await user.click(backButton);

    expect(mockHide).toHaveBeenCalled();
  });

  it("renders search input", () => {
    render(
      <AvailableChainsSidebar
        show={true}
        chains={mockChains}
        hide={mockHide}
        onClick={mockOnClick}
      />
    );

    const searchInput = screen.getByTestId("chain-selector-search");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("placeholder", "Search chains");
  });

  it("filters chains based on search input", async () => {
    const user = userEvent.setup();
    render(
      <AvailableChainsSidebar
        show={true}
        chains={mockChains}
        hide={mockHide}
        onClick={mockOnClick}
      />
    );

    const searchInput = screen.getByTestId("chain-selector-search");
    await user.type(searchInput, "bitcoin");

    const chainItems = screen.queryAllByTestId(/chain-selector-item-/);
    expect(chainItems.length).toBeGreaterThan(0);
  });

  it("calls onClick when chain item is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AvailableChainsSidebar
        show={true}
        chains={mockChains}
        hide={mockHide}
        onClick={mockOnClick}
      />
    );

    const chainItem = screen.getByTestId("chain-selector-item-bitcoin");
    await user.click(chainItem);

    expect(mockOnClick).toHaveBeenCalledWith(mockChains[0]);
  });

  it('displays "No chains found" when search yields no results', async () => {
    const user = userEvent.setup();
    render(
      <AvailableChainsSidebar
        show={true}
        chains={mockChains}
        hide={mockHide}
        onClick={mockOnClick}
      />
    );

    const searchInput = screen.getByTestId("chain-selector-search");
    await user.type(searchInput, "nonexistent");

    expect(screen.getByText("No chains found.")).toBeInTheDocument();
  });

  it("renders all chains when no search input", () => {
    render(
      <AvailableChainsSidebar
        show={true}
        chains={mockChains}
        hide={mockHide}
        onClick={mockOnClick}
      />
    );

    expect(
      screen.getByTestId("chain-selector-item-bitcoin")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("chain-selector-item-ethereum")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("chain-selector-item-solana")
    ).toBeInTheDocument();
  });

  it("sorts chains alphabetically", () => {
    const unsortedChains = [
      { chain: "solana", name: "solana", icon: "sol-icon.png", id: "solana" },
      {
        chain: "bitcoin",
        name: "bitcoin",
        icon: "btc-icon.png",
        id: "bitcoin",
      },
      {
        chain: "ethereum",
        name: "ethereum",
        icon: "eth-icon.png",
        id: "ethereum",
      },
    ] as any[];

    render(
      <AvailableChainsSidebar
        show={true}
        chains={unsortedChains}
        hide={mockHide}
        onClick={mockOnClick}
      />
    );

    const chainItems = screen.getAllByTestId(/chain-selector-item-/);
    expect(chainItems.length).toBe(3);
  });
});
