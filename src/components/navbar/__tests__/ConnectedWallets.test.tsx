import { render, screen } from "../../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import ConnectedWallets from "../ConnectedWallets";
import { OrderStatus } from "@gardenfi/orderbook";

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
  WalletIcon: ({
    className,
    "data-testid": dataTestId,
  }: {
    className?: string;
    "data-testid"?: string;
  }) => (
    <div data-testid={dataTestId} className={className}>
      WalletIcon
    </div>
  ),
  Opacity: ({
    children,
    onClick,
    className,
    level,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    level?: string;
  }) => (
    <div
      data-testid="navbar-wallets-button"
      onClick={onClick}
      className={className}
      data-level={level}
    >
      {children}
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

// Mock useGarden
const mockUseGarden = jest.fn();
jest.mock("@gardenfi/react-hooks", () => ({
  useGarden: () => mockUseGarden(),
}));

// Mock stores
const mockModalStore = jest.fn();
jest.mock("../../../store/modalStore", () => ({
  modalStore: () => mockModalStore(),
  modalNames: {
    transactions: "transactions",
  },
}));

const mockPendingOrdersStore = jest.fn();
jest.mock("../../../store/pendingOrdersStore", () => ({
  __esModule: true,
  default: () => mockPendingOrdersStore(),
}));

const mockDeletedOrdersStore = jest.fn();
jest.mock("../../../store/deletedOrdersStore", () => ({
  deletedOrdersStore: () => mockDeletedOrdersStore(),
}));

// Mock constants
jest.mock("../connectWallet/constants", () => ({
  ecosystems: {
    evm: { icon: "evm-icon.svg" },
    bitcoin: { icon: "bitcoin-icon.svg" },
    litecoin: { icon: "litecoin-icon.svg" },
    starknet: { icon: "starknet-icon.svg" },
    solana: { icon: "solana-icon.svg" },
    sui: { icon: "sui-icon.svg" },
    tron: { icon: "tron-icon.svg" },
  },
}));

describe("ConnectedWallets", () => {
  const mockSetOpenModal = jest.fn();
  const mockSetPendingOrders = jest.fn();
  const mockIsOrderDeleted = jest.fn();
  const mockCleanupDeletedOrders = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock returns
    mockUseEVMWallet.mockReturnValue({ address: null });
    mockUseStarknetWallet.mockReturnValue({ starknetAddress: null });
    mockUseBitcoinWallet.mockReturnValue({ account: null });
    mockUseLitecoinWallet.mockReturnValue({ account: null });
    mockUseSolanaWallet.mockReturnValue({ solanaAddress: null });
    mockUseSuiWallet.mockReturnValue({
      suiConnected: false,
      currentAccount: null,
    });
    mockUseTronWallet.mockReturnValue({ tronConnected: false, wallet: null });
    mockUseGarden.mockReturnValue({ pendingOrders: [] });
    mockModalStore.mockReturnValue({ setOpenModal: mockSetOpenModal });
    mockPendingOrdersStore.mockReturnValue({
      pendingOrders: [],
      setPendingOrders: mockSetPendingOrders,
    });
    mockDeletedOrdersStore.mockReturnValue({
      isOrderDeleted: mockIsOrderDeleted,
      cleanupDeletedOrders: mockCleanupDeletedOrders,
      deletedOrders: [],
    });
  });

  it("renders wallet button", () => {
    render(<ConnectedWallets />);
    expect(screen.getByTestId("navbar-wallets-button")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-wallets-icon")).toBeInTheDocument();
  });

  it("opens transactions modal when clicked", async () => {
    const user = userEvent.setup();
    render(<ConnectedWallets />);

    const button = screen.getByTestId("navbar-wallets-button");
    await user.click(button);

    expect(mockSetOpenModal).toHaveBeenCalledWith("transactions");
  });

  it("displays EVM wallet icon when EVM wallet is connected", () => {
    mockUseEVMWallet.mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
    });

    render(<ConnectedWallets />);

    expect(screen.getByTestId("navbar-wallet-evm-icon")).toBeInTheDocument();
    expect(screen.getByAltText("EVM wallet")).toBeInTheDocument();
  });

  it("displays Bitcoin wallet icon when Bitcoin wallet is connected", () => {
    mockUseBitcoinWallet.mockReturnValue({
      account: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    });

    render(<ConnectedWallets />);

    expect(
      screen.getByTestId("navbar-wallet-bitcoin-icon")
    ).toBeInTheDocument();
    expect(screen.getByAltText("Bitcoin wallet")).toBeInTheDocument();
  });

  it("displays Litecoin wallet icon when Litecoin wallet is connected", () => {
    mockUseLitecoinWallet.mockReturnValue({
      account: "ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    });

    render(<ConnectedWallets />);

    expect(
      screen.getByTestId("navbar-wallet-litecoin-icon")
    ).toBeInTheDocument();
    expect(screen.getByAltText("Litecoin wallet")).toBeInTheDocument();
  });

  it("displays Starknet wallet icon when Starknet wallet is connected", () => {
    mockUseStarknetWallet.mockReturnValue({
      starknetAddress:
        "0x1234567890123456789012345678901234567890123456789012345678901234",
    });

    render(<ConnectedWallets />);

    expect(
      screen.getByTestId("navbar-wallet-starknet-icon")
    ).toBeInTheDocument();
    expect(screen.getByAltText("Starknet wallet")).toBeInTheDocument();
  });

  it("displays Solana wallet icon when Solana wallet is connected", () => {
    mockUseSolanaWallet.mockReturnValue({
      solanaAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    });

    render(<ConnectedWallets />);

    expect(screen.getByTestId("navbar-wallet-solana-icon")).toBeInTheDocument();
    expect(screen.getByAltText("Solana wallet")).toBeInTheDocument();
  });

  it("displays Sui wallet icon when Sui wallet is connected", () => {
    mockUseSuiWallet.mockReturnValue({
      suiConnected: true,
      currentAccount: { address: "0x123" },
    });

    render(<ConnectedWallets />);

    expect(screen.getByTestId("navbar-wallet-sui-icon")).toBeInTheDocument();
    expect(screen.getByAltText("Sui wallet")).toBeInTheDocument();
  });

  it("displays Tron wallet icon when Tron wallet is connected", () => {
    mockUseTronWallet.mockReturnValue({
      tronConnected: true,
      wallet: { address: { base58: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" } },
    });

    render(<ConnectedWallets />);

    expect(screen.getByTestId("navbar-wallet-tron-icon")).toBeInTheDocument();
    expect(screen.getByAltText("Tron wallet")).toBeInTheDocument();
  });

  it("displays multiple wallet icons when multiple wallets are connected", () => {
    mockUseEVMWallet.mockReturnValue({ address: "0x123" });
    mockUseBitcoinWallet.mockReturnValue({
      account: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    });
    mockUseSolanaWallet.mockReturnValue({
      solanaAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    });

    render(<ConnectedWallets />);

    expect(screen.getByTestId("navbar-wallet-evm-icon")).toBeInTheDocument();
    expect(
      screen.getByTestId("navbar-wallet-bitcoin-icon")
    ).toBeInTheDocument();
    expect(screen.getByTestId("navbar-wallet-solana-icon")).toBeInTheDocument();
  });

  it("displays pending orders badge when there are pending orders", () => {
    mockPendingOrdersStore.mockReturnValue({
      pendingOrders: [
        { order_id: "1", status: OrderStatus.Created },
        { order_id: "2", status: OrderStatus.InitiateDetected },
      ],
      setPendingOrders: mockSetPendingOrders,
    });
    mockDeletedOrdersStore.mockReturnValue({
      isOrderDeleted: mockIsOrderDeleted.mockReturnValue(false),
      cleanupDeletedOrders: mockCleanupDeletedOrders,
      deletedOrders: [],
    });

    render(<ConnectedWallets />);

    expect(
      screen.getByTestId("navbar-pending-orders-badge")
    ).toBeInTheDocument();
    expect(screen.getByTestId("navbar-pending-orders-count")).toHaveTextContent(
      "2"
    );
  });

  it("does not display pending orders badge when count is zero", () => {
    mockPendingOrdersStore.mockReturnValue({
      pendingOrders: [],
      setPendingOrders: mockSetPendingOrders,
    });

    render(<ConnectedWallets />);

    expect(
      screen.queryByTestId("navbar-pending-orders-badge")
    ).not.toBeInTheDocument();
  });

  it("excludes RedeemDetected and Redeemed orders from count", () => {
    mockPendingOrdersStore.mockReturnValue({
      pendingOrders: [
        { order_id: "1", status: OrderStatus.Created },
        { order_id: "2", status: OrderStatus.RedeemDetected },
        { order_id: "3", status: OrderStatus.Redeemed },
      ],
      setPendingOrders: mockSetPendingOrders,
    });
    mockDeletedOrdersStore.mockReturnValue({
      isOrderDeleted: mockIsOrderDeleted.mockReturnValue(false),
      cleanupDeletedOrders: mockCleanupDeletedOrders,
      deletedOrders: [],
    });

    render(<ConnectedWallets />);

    expect(screen.getByTestId("navbar-pending-orders-count")).toHaveTextContent(
      "1"
    );
  });

  it("excludes deleted orders from count", () => {
    mockPendingOrdersStore.mockReturnValue({
      pendingOrders: [
        { order_id: "1", status: OrderStatus.Created },
        { order_id: "2", status: OrderStatus.Created },
      ],
      setPendingOrders: mockSetPendingOrders,
    });
    mockDeletedOrdersStore.mockReturnValue({
      isOrderDeleted: jest.fn((orderId) => orderId === "2"),
      cleanupDeletedOrders: mockCleanupDeletedOrders,
      deletedOrders: [{ orderId: "2" }],
    });

    render(<ConnectedWallets />);

    expect(screen.getByTestId("navbar-pending-orders-count")).toHaveTextContent(
      "1"
    );
  });

  it("shows shine effect when there are pending orders", () => {
    mockPendingOrdersStore.mockReturnValue({
      pendingOrders: [{ order_id: "1", status: OrderStatus.Created }],
      setPendingOrders: mockSetPendingOrders,
    });
    mockDeletedOrdersStore.mockReturnValue({
      isOrderDeleted: mockIsOrderDeleted.mockReturnValue(false),
      cleanupDeletedOrders: mockCleanupDeletedOrders,
      deletedOrders: [],
    });

    const { container } = render(<ConnectedWallets />);

    const shineElement = container.querySelector(".navbar-shine");
    expect(shineElement).toBeInTheDocument();
  });

  it("updates pending orders when useGarden orders change", () => {
    const { rerender } = render(<ConnectedWallets />);

    mockUseGarden.mockReturnValue({
      pendingOrders: [{ order_id: "1", status: OrderStatus.Created }],
    });

    rerender(<ConnectedWallets />);

    expect(mockSetPendingOrders).toHaveBeenCalled();
  });

  it("filters out expired orders", () => {
    mockUseGarden.mockReturnValue({
      pendingOrders: [
        { order_id: "1", status: OrderStatus.Created },
        { order_id: "2", status: OrderStatus.Expired },
      ],
    });
    mockDeletedOrdersStore.mockReturnValue({
      isOrderDeleted: mockIsOrderDeleted.mockReturnValue(false),
      cleanupDeletedOrders: mockCleanupDeletedOrders,
      deletedOrders: [],
    });

    render(<ConnectedWallets />);

    expect(mockSetPendingOrders).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ order_id: "1" })])
    );
    expect(mockSetPendingOrders).toHaveBeenCalledWith(
      expect.not.arrayContaining([expect.objectContaining({ order_id: "2" })])
    );
  });

  it("calls cleanupDeletedOrders when pending orders exist", () => {
    mockUseGarden.mockReturnValue({
      pendingOrders: [{ order_id: "1", status: OrderStatus.Created }],
    });

    render(<ConnectedWallets />);

    expect(mockCleanupDeletedOrders).toHaveBeenCalled();
  });
});
