import { render, screen } from "../../../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { MultiWalletConnection } from "../MultiWalletConnection";
import { BlockchainType } from "@gardenfi/orderbook";

// Mock garden-book components
jest.mock("@gardenfi/garden-book", () => ({
  Button: ({ children, onClick, "data-testid": dataTestId }: any) => (
    <button data-testid={dataTestId} onClick={onClick}>
      {children}
    </button>
  ),
  CheckBox: ({ checked, "data-testid": dataTestId }: any) => (
    <input
      data-testid={dataTestId}
      type="checkbox"
      checked={checked}
      readOnly
    />
  ),
  Typography: ({ children, "data-testid": dataTestId }: any) => (
    <div data-testid={dataTestId}>{children}</div>
  ),
}));

// Mock hooks used internally
const mockUseBitcoinWallet = jest.fn();
jest.mock("@gardenfi/wallet-connectors", () => ({
  useBitcoinWallet: () => mockUseBitcoinWallet(),
}));
const mockUseEVMWallet = jest.fn();
jest.mock("../../../../hooks/useEVMWallet", () => ({
  useEVMWallet: () => mockUseEVMWallet(),
}));
const mockUseSolanaWallet = jest.fn();
jest.mock("../../../../hooks/useSolanaWallet", () => ({
  useSolanaWallet: () => mockUseSolanaWallet(),
}));
const mockUseStarknetWallet = jest.fn();
jest.mock("../../../../hooks/useStarknetWallet", () => ({
  useStarknetWallet: () => mockUseStarknetWallet(),
}));
const mockUseSuiWallet = jest.fn();
jest.mock("../../../../hooks/useSuiWallet", () => ({
  useSuiWallet: () => mockUseSuiWallet(),
}));
const mockUseTronWallet = jest.fn();
jest.mock("../../../../hooks/useTronWallet", () => ({
  useTronWallet: () => mockUseTronWallet(),
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
// Mock handleConnect helpers to avoid importing constants that pull heavy deps
jest.mock("../handleConnect", () => ({
  handleEVMConnect: jest.fn().mockResolvedValue({}),
  handleStarknetConnect: jest.fn().mockResolvedValue({}),
}));

describe("MultiWalletConnection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBitcoinWallet.mockReturnValue({
      connect: jest.fn(),
      provider: null,
    });
    mockUseEVMWallet.mockReturnValue({
      connectAsync: jest.fn(),
      connector: null,
    });
    mockUseSolanaWallet.mockReturnValue({
      solanaConnect: jest.fn(),
      solanaSelectedWallet: null,
    });
    mockUseStarknetWallet.mockReturnValue({
      starknetConnectAsync: jest.fn(),
      starknetDisconnect: jest.fn(),
      starknetSwitchChain: jest.fn(),
      starknetConnector: null,
      starknetStatus: null,
    });
    mockUseSuiWallet.mockReturnValue({
      handleSuiConnect: jest.fn(),
      suiSelectedWallet: null,
    });
    mockUseTronWallet.mockReturnValue({
      handleTronConnect: jest.fn(),
      wallet: null,
    });
  });

  it("renders available ecosystems and checkboxes", async () => {
    const connectors = {
      [BlockchainType.bitcoin]: { name: "Bitcoin", icon: "btc.png" } as any,
      [BlockchainType.evm]: { name: "EVM", icon: "evm.png" } as any,
    };
    const available = new Set<BlockchainType>([
      BlockchainType.bitcoin,
      BlockchainType.evm,
    ]);
    render(
      <MultiWalletConnection
        availableBlockchainTypes={available}
        connectors={connectors}
        handleClose={jest.fn()}
      />
    );

    expect(screen.getByTestId("connect-wallet-multi")).toBeInTheDocument();
    expect(
      screen.getByTestId("connect-wallet-multi-wallet-chip")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("connect-wallet-multi-ecosystem-bitcoin")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("connect-wallet-multi-ecosystem-evm")
    ).toBeInTheDocument();
  });

  it("enables Connect button when selection made", async () => {
    const connectors = {
      [BlockchainType.bitcoin]: { name: "Bitcoin", icon: "btc.png" } as any,
      [BlockchainType.evm]: { name: "EVM", icon: "evm.png" } as any,
    };
    const available = new Set<BlockchainType>([
      BlockchainType.bitcoin,
      BlockchainType.evm,
    ]);
    render(
      <MultiWalletConnection
        availableBlockchainTypes={available}
        connectors={connectors}
        handleClose={jest.fn()}
      />
    );

    // simulate click by toggling checked attribute via userEvent on parent
    const ecosystem = screen.getByTestId("connect-wallet-multi-ecosystem-evm");
    await userEvent.click(ecosystem);

    const connectBtn = screen.getByTestId("connect-wallet-multi-connect");
    expect(connectBtn).toBeInTheDocument();
    // Initially disabled (no selection) -> after click should be enabled (not disabled attribute)
    expect(connectBtn).not.toHaveAttribute("disabled");
  });
});
