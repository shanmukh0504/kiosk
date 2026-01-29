import { render, screen } from "../../../../__tests__/test-utils";
import { WalletRow } from "../WalletRow";

// Mock garden-book Typography
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({ children, "data-testid": dataTestId }: any) => (
    <div data-testid={dataTestId}>{children}</div>
  ),
}));

// Mock Loader
jest.mock("../../../../common/Loader", () => ({
  Loader: () => <div data-testid="loader">Loader</div>,
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

describe("WalletRow", () => {
  it("renders loading skeleton when isLoadingChains is true", () => {
    const props = {
      name: "Test",
      logo: "logo.png",
      onClick: jest.fn(),
      isConnecting: false,
      isConnected: {} as any,
      isAvailable: true,
      isLoadingChains: true,
      index: 1,
    };
    const { container } = render(<WalletRow {...props} />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders as disabled when not available", async () => {
    const onClick = jest.fn();
    render(
      <WalletRow
        name="Injected"
        logo="logo.png"
        onClick={onClick}
        isConnecting={false}
        isConnected={{} as any}
        isAvailable={false}
        index={0}
      />
    );
    const row = screen.getByTestId("connect-wallet-row-injected");
    // Should have disabled styles/classes when not available
    expect(row.className).toMatch(/pointer-events-none/);
  });

  it("shows Loader when isConnecting is true", () => {
    const onClick = jest.fn();
    render(
      <WalletRow
        name="MetaMask"
        logo="logo.png"
        onClick={onClick}
        isConnecting={true}
        isConnected={{} as any}
        isAvailable={true}
        index={0}
      />
    );
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("shows connected state when isConnected has a true value", () => {
    const onClick = jest.fn();
    render(
      <WalletRow
        name="MetaMask"
        logo="logo.png"
        onClick={onClick}
        isConnecting={false}
        isConnected={{ evm: true } as any}
        isAvailable={true}
        index={0}
      />
    );
    expect(screen.getByTestId("wallet-connected")).toBeInTheDocument();
  });
});
