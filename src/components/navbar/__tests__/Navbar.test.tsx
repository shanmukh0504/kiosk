import { render, screen } from "../../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { Navbar } from "../Navbar";

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({
    children,
    "data-testid": dataTestId,
    size,
    weight,
  }: {
    children: React.ReactNode;
    "data-testid"?: string;
    size?: string;
    weight?: string;
  }) => (
    <div data-testid={dataTestId} data-size={size} data-weight={weight}>
      {children}
    </div>
  ),
  Button: ({
    children,
    onClick,
    "data-testid": dataTestId,
    variant,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    "data-testid"?: string;
    variant?: string;
    className?: string;
  }) => (
    <button
      data-testid={dataTestId}
      onClick={onClick}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
  GardenFullLogo: ({
    onClick,
    className,
    "data-testid": dataTestId,
  }: {
    onClick?: () => void;
    className?: string;
    "data-testid"?: string;
  }) => (
    <div data-testid={dataTestId} onClick={onClick} className={className}>
      GardenFullLogo
    </div>
  ),
  GardenIcon: ({
    onClick,
    className,
    "data-testid": dataTestId,
  }: {
    onClick?: () => void;
    className?: string;
    "data-testid"?: string;
  }) => (
    <div data-testid={dataTestId} onClick={onClick} className={className}>
      GardenIcon
    </div>
  ),
  CodeBlockIcon: ({ className }: { className?: string }) => (
    <div data-testid="code-block-icon" className={className}>
      CodeBlockIcon
    </div>
  ),
}));

// Mock wallet hooks
const mockUseEVMWallet = jest.fn();
jest.mock("../../../hooks/useEVMWallet", () => ({
  useEVMWallet: () => mockUseEVMWallet(),
}));

const mockUseStarknetWallet = jest.fn();
jest.mock("../../../hooks/useStarknetWallet", () => ({
  useStarknetWallet: () => mockUseStarknetWallet(),
}));

const mockUseSolanaWallet = jest.fn();
jest.mock("../../../hooks/useSolanaWallet", () => ({
  useSolanaWallet: () => mockUseSolanaWallet(),
}));

const mockUseSuiWallet = jest.fn();
jest.mock("../../../hooks/useSuiWallet", () => ({
  useSuiWallet: () => mockUseSuiWallet(),
}));

const mockUseTronWallet = jest.fn();
jest.mock("../../../hooks/useTronWallet", () => ({
  useTronWallet: () => mockUseTronWallet(),
}));

const mockUseBitcoinWallet = jest.fn();
const mockUseLitecoinWallet = jest.fn();
jest.mock("@gardenfi/wallet-connectors", () => ({
  useBitcoinWallet: () => mockUseBitcoinWallet(),
  useLitecoinWallet: () => mockUseLitecoinWallet(),
}));

// Mock stores
const mockModalStore = jest.fn();
jest.mock("../../../store/modalStore", () => ({
  modalStore: () => mockModalStore(),
  modalNames: {
    connectWallet: "connectWallet",
  },
}));

const mockViewPortStore = jest.fn();
jest.mock("../../../store/viewPortStore", () => ({
  viewPortStore: () => mockViewPortStore(),
}));

// Mock constants
jest.mock("../../../constants/constants", () => ({
  routes: [
    ["home", { name: "Swap", path: ["/"], isExternal: false }],
    ["stake", { name: "Stake", path: ["/stake"], isExternal: false }],
    ["quests", { name: "Quests", path: ["/quests"], isExternal: false }],
  ],
  isTestnet: false,
}));

// Mock utils
jest.mock("../../../utils/utils", () => ({
  isCurrentRoute: jest.fn((path: string) => path === "/"),
}));

// Mock API
jest.mock("../../../constants/api", () => ({
  API: jest.fn(() => ({
    home: "https://garden.fi",
  })),
}));

// Mock ConnectedWallets
jest.mock("../ConnectedWallets", () => ({
  __esModule: true,
  default: () => <div data-testid="connected-wallets">ConnectedWallets</div>,
}));

// Mock MobileMenu
jest.mock("../MobileMenu", () => ({
  MobileMenu: () => <div data-testid="mobile-menu">MobileMenu</div>,
}));

describe("Navbar", () => {
  const mockSetOpenModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.open = jest.fn();

    // Default mocks - no wallets connected
    mockUseEVMWallet.mockReturnValue({ isConnected: false, address: null });
    mockUseStarknetWallet.mockReturnValue({ starknetAddress: null });
    mockUseBitcoinWallet.mockReturnValue({ account: null });
    mockUseLitecoinWallet.mockReturnValue({ account: null });
    mockUseSolanaWallet.mockReturnValue({ solanaAddress: null });
    mockUseSuiWallet.mockReturnValue({ suiConnected: false });
    mockUseTronWallet.mockReturnValue({ tronConnected: false });
    mockModalStore.mockReturnValue({ setOpenModal: mockSetOpenModal });
    mockViewPortStore.mockReturnValue({ isMobile: false });
  });

  it("renders navbar", () => {
    render(<Navbar />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("renders desktop logo on larger screens", () => {
    mockViewPortStore.mockReturnValue({ isMobile: false });

    render(<Navbar />);

    expect(screen.getByTestId("navbar-logo-desktop")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-logo-desktop")).not.toHaveClass(
      "sm:hidden"
    );
  });

  it("renders mobile logo on mobile screens", () => {
    mockViewPortStore.mockReturnValue({ isMobile: true });

    render(<Navbar />);

    expect(screen.getByTestId("navbar-logo-mobile")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-logo-mobile")).toHaveClass("sm:hidden");
  });

  it("opens home page when logo is clicked", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const logo = screen.getByTestId("navbar-logo-desktop");
    await user.click(logo);

    expect(global.open).toHaveBeenCalledWith("https://garden.fi", "_blank");
  });

  it("renders navigation links on desktop", () => {
    mockViewPortStore.mockReturnValue({ isMobile: false });

    render(<Navbar />);

    expect(screen.getByTestId("navbar-link-swap")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-link-stake")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-link-quests")).toBeInTheDocument();
  });

  it("highlights active route", () => {
    render(<Navbar />);

    const swapLink = screen.getByTestId("navbar-link-swap");
    const typography = swapLink.querySelector('[data-weight="medium"]');
    expect(typography).toBeInTheDocument();
  });

  it("renders connect button when no wallets are connected", () => {
    render(<Navbar />);

    expect(screen.getByTestId("navbar-connect-button")).toBeInTheDocument();
    expect(screen.getByText("Connect")).toBeInTheDocument();
  });

  it("opens connect wallet modal when connect button is clicked", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const connectButton = screen.getByTestId("navbar-connect-button");
    await user.click(connectButton);

    expect(mockSetOpenModal).toHaveBeenCalledWith("connectWallet");
  });

  it("does not render connect button when already connected", () => {
    mockUseEVMWallet.mockReturnValue({ isConnected: true, address: "0x123" });

    render(<Navbar />);

    expect(
      screen.queryByTestId("navbar-connect-button")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("connected-wallets")).toBeInTheDocument();
  });

  it("renders ConnectedWallets when any wallet is connected", () => {
    mockUseEVMWallet.mockReturnValue({
      isConnected: true,
      address: "0x1234567890123456789012345678901234567890",
    });

    render(<Navbar />);

    expect(screen.getByTestId("connected-wallets")).toBeInTheDocument();
    expect(
      screen.queryByTestId("navbar-connect-button")
    ).not.toBeInTheDocument();
  });

  it("renders ConnectedWallets when EVM wallet is connected", () => {
    mockUseEVMWallet.mockReturnValue({ isConnected: true, address: "0x123" });

    render(<Navbar />);

    expect(screen.getByTestId("connected-wallets")).toBeInTheDocument();
  });

  it("renders ConnectedWallets when Bitcoin wallet is connected", () => {
    mockUseBitcoinWallet.mockReturnValue({
      account: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    });

    render(<Navbar />);

    expect(screen.getByTestId("connected-wallets")).toBeInTheDocument();
  });

  it("renders ConnectedWallets when Litecoin wallet is connected", () => {
    mockUseLitecoinWallet.mockReturnValue({
      account: "ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    });

    render(<Navbar />);

    expect(screen.getByTestId("connected-wallets")).toBeInTheDocument();
  });

  it("renders ConnectedWallets when Starknet wallet is connected", () => {
    mockUseStarknetWallet.mockReturnValue({
      starknetAddress:
        "0x1234567890123456789012345678901234567890123456789012345678901234",
    });

    render(<Navbar />);

    expect(screen.getByTestId("connected-wallets")).toBeInTheDocument();
  });

  it("renders ConnectedWallets when Solana wallet is connected", () => {
    mockUseSolanaWallet.mockReturnValue({
      solanaAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    });

    render(<Navbar />);

    expect(screen.getByTestId("connected-wallets")).toBeInTheDocument();
  });

  it("renders ConnectedWallets when Sui wallet is connected", () => {
    mockUseSuiWallet.mockReturnValue({ suiConnected: true });

    render(<Navbar />);

    expect(screen.getByTestId("connected-wallets")).toBeInTheDocument();
  });

  it("renders ConnectedWallets when Tron wallet is connected", () => {
    mockUseTronWallet.mockReturnValue({ tronConnected: true });

    render(<Navbar />);

    expect(screen.getByTestId("connected-wallets")).toBeInTheDocument();
  });

  it("renders MobileMenu component", () => {
    render(<Navbar />);

    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
  });
});
