import { render, screen } from "../../../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ConnectWallet } from "../ConnectWallet";

// Mock garden-book components used
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({ children, "data-testid": dataTestId }: any) => (
    <div data-testid={dataTestId}>{children}</div>
  ),
  Chip: ({ children, onClick, "data-testid": dataTestId }: any) => (
    <div data-testid={dataTestId} onClick={onClick}>
      {children}
    </div>
  ),
  CloseIcon: ({ onClick, "data-testid": dataTestId }: any) => (
    <div data-testid={dataTestId} onClick={onClick}>
      Close
    </div>
  ),
  RadioCheckedIcon: () => <div data-testid="radio-icon" />,
  ArrowLeftIcon: ({ onClick, "data-testid": dataTestId }: any) => (
    <div data-testid={dataTestId} onClick={onClick}>
      Back
    </div>
  ),
}));

// Mock getSupportedWallets to return a simple wallet list
jest.mock("../getSupportedWallets", () => ({
  getAvailableWallets: () => [
    {
      id: "injected",
      name: "Injected",
      logo: "injected.png",
      isAvailable: true,
      // properties used by blockchainTypeToWalletProperty mapping
      isEVM: true,
      isBitcoin: false,
      isSolana: false,
      isSui: false,
      isTron: false,
      isLitecoin: false,
    },
  ],
  getWalletConnectionStatus: () => false,
}));

// Mock hooks and stores
jest.mock("../../../../hooks/useEVMWallet", () => ({
  useEVMWallet: () => ({
    connectors: [],
    connectAsync: jest.fn(),
    connector: null,
  }),
}));
jest.mock("@gardenfi/wallet-connectors", () => ({
  useBitcoinWallet: () => ({
    availableWallets: [],
    connect: jest.fn(),
    provider: null,
  }),
  useLitecoinWallet: () => ({
    availableWallets: [],
    connect: jest.fn(),
    provider: null,
  }),
}));
jest.mock("../../../../store/modalStore", () => ({
  modalStore: () => ({ modalData: {} }),
}));
jest.mock("../../../../store/connectWalletStore", () => ({
  ConnectingWalletStore: () => ({
    connectingWallet: null,
    setConnectingWallet: jest.fn(),
  }),
}));
jest.mock("../../../../store/assetInfoStore", () => ({
  assetInfoStore: () => ({ chains: { ethereum: {} }, isLoading: false }),
}));
// Mock connectWallet constants to avoid heavy imports
jest.mock("../constants", () => ({
  ecosystems: {
    evm: { icon: "evm.png", name: "EVM" },
    bitcoin: { icon: "btc.png", name: "Bitcoin" },
    solana: { icon: "sol.png", name: "Solana" },
  },
  blockchainTypeToWalletProperty: {
    evm: "isEVM",
    bitcoin: "isBitcoin",
    solana: "isSolana",
    sui: "isSui",
    tron: "isTron",
    litecoin: "isLitecoin",
  },
}));
// Mock Loader used by WalletRow
jest.mock("../../../../common/Loader", () => ({
  Loader: () => <div data-testid="loader">Loader</div>,
}));
// Mock handleConnect helpers to avoid importing constants that pull heavy deps
jest.mock("../handleConnect", () => ({
  handleEVMConnect: jest.fn().mockResolvedValue({}),
  handleStarknetConnect: jest.fn().mockResolvedValue({}),
}));
// Mock other wallet hooks used by ConnectWallet to avoid importing heavy deps
jest.mock("../../../../hooks/useStarknetWallet", () => ({
  useStarknetWallet: () => ({
    starknetConnectors: [],
    starknetConnector: null,
    starknetStatus: null,
    starknetConnectAsync: jest.fn(),
    starknetDisconnect: jest.fn(),
    starknetSwitchChain: jest.fn(),
  }),
}));
jest.mock("../../../../hooks/useSolanaWallet", () => ({
  useSolanaWallet: () => ({
    solanaWallets: [],
    solanaConnect: jest.fn(),
    solanaConnected: false,
    solanaDisconnect: jest.fn(),
    solanaSelectedWallet: null,
  }),
}));
jest.mock("../../../../hooks/useSuiWallet", () => ({
  useSuiWallet: () => ({
    suiConnected: false,
    suiSelectedWallet: null,
    suiWallets: [],
    handleSuiConnect: jest.fn(),
  }),
}));
jest.mock("../../../../hooks/useTronWallet", () => ({
  useTronWallet: () => ({
    wallets: [],
    handleTronConnect: jest.fn(),
    tronConnected: false,
    wallet: null,
  }),
}));

describe("ConnectWallet", () => {
  it("renders header and wallet list", () => {
    const onClose = jest.fn();
    render(<ConnectWallet open onClose={onClose} />);
    expect(screen.getByTestId("connect-wallet-title")).toBeInTheDocument();
    expect(screen.getByTestId("connect-wallet-list")).toBeInTheDocument();
  });

  it("renders wallet rows and calls close on close click", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<ConnectWallet open onClose={onClose} />);

    expect(screen.getByTestId("connect-wallet-list")).toBeInTheDocument();
    const close = screen.getByTestId("connect-wallet-close");
    await user.click(close);
    expect(onClose).toHaveBeenCalled();
  });
});
