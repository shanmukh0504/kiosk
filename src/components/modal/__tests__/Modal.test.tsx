import { render, screen } from "../../../__tests__/test-utils";
import { Modal } from "../Modal";

// Mock child components
jest.mock("../../navbar/connectWallet/ConnectWallet", () => ({
  ConnectWallet: ({ open }: { open: boolean }) => (
    <div data-testid="connect-wallet" data-open={open.toString()}>
      ConnectWallet
    </div>
  ),
}));

jest.mock("../../transactions/TransactionsComponent", () => ({
  TransactionsComponent: ({ open }: { open: boolean }) => (
    <div data-testid="transactions-component" data-open={open.toString()}>
      TransactionsComponent
    </div>
  ),
}));

jest.mock("../ResponsiveModal", () => ({
  ResponsiveModal: ({
    open,
    children,
  }: {
    open: boolean;
    children: React.ReactNode;
  }) => (
    <div data-testid="responsive-modal" data-open={open.toString()}>
      {children}
    </div>
  ),
}));

jest.mock("../../swap/AssetSelector", () => ({
  AssetSelector: () => <div data-testid="asset-selector">AssetSelector</div>,
}));

jest.mock("../../stake/modal/StakeModal", () => ({
  StakeModal: () => <div data-testid="stake-modal">StakeModal</div>,
}));

// Mock constants to avoid import.meta.env issues
jest.mock("../../../constants/constants", () => ({}));

// Mock modalStore
const mockModalStore = jest.fn();
jest.mock("../../../store/modalStore", () => ({
  modalStore: () => mockModalStore(),
  modalNames: {
    connectWallet: "connectWallet",
    transactions: "transactions",
    assetList: "assetList",
    manageStake: "manageStake",
  },
}));

describe("Modal", () => {
  const mockSetCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockModalStore.mockReturnValue({
      modalName: {
        connectWallet: false,
        transactions: false,
        assetList: false,
        manageStake: false,
      },
      setCloseModal: mockSetCloseModal,
    });
  });

  it("renders all modal components", () => {
    render(<Modal />);
    expect(screen.getByTestId("connect-wallet")).toBeInTheDocument();
    expect(screen.getByTestId("transactions-component")).toBeInTheDocument();
    expect(screen.getByTestId("asset-selector")).toBeInTheDocument();
    expect(screen.getByTestId("stake-modal")).toBeInTheDocument();
  });

  it("opens connectWallet modal when modalName.connectWallet is true", () => {
    mockModalStore.mockReturnValue({
      modalName: {
        connectWallet: true,
        transactions: false,
        assetList: false,
        manageStake: false,
      },
      setCloseModal: mockSetCloseModal,
    });

    render(<Modal />);
    const connectWallet = screen.getByTestId("connect-wallet");
    expect(connectWallet).toHaveAttribute("data-open", "true");
  });

  it("opens transactions modal when modalName.transactions is true", () => {
    mockModalStore.mockReturnValue({
      modalName: {
        connectWallet: false,
        transactions: true,
        assetList: false,
        manageStake: false,
      },
      setCloseModal: mockSetCloseModal,
    });

    render(<Modal />);
    const transactionsComponent = screen.getByTestId("transactions-component");
    expect(transactionsComponent).toHaveAttribute("data-open", "true");
  });

  it("closes transactions modal on Escape key", () => {
    mockModalStore.mockReturnValue({
      modalName: {
        connectWallet: false,
        transactions: true,
        assetList: false,
        manageStake: false,
      },
      setCloseModal: mockSetCloseModal,
    });

    render(<Modal />);

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    window.dispatchEvent(escapeEvent);

    expect(mockSetCloseModal).toHaveBeenCalledWith("transactions");
  });

  it("does not close modal on other keys", () => {
    mockModalStore.mockReturnValue({
      modalName: {
        connectWallet: false,
        transactions: true,
        assetList: false,
        manageStake: false,
      },
      setCloseModal: mockSetCloseModal,
    });

    render(<Modal />);

    const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
    window.dispatchEvent(enterEvent);

    expect(mockSetCloseModal).not.toHaveBeenCalled();
  });

  it("cleans up event listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = render(<Modal />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    removeEventListenerSpy.mockRestore();
  });
});
