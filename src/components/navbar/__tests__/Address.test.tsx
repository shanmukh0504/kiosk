import { render, screen } from "../../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { Address } from "../Address";

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="typography" className={className}>
      {children}
    </div>
  ),
  WalletIcon: ({ className }: { className?: string }) => (
    <div data-testid="wallet-icon" className={className}>
      WalletIcon
    </div>
  ),
  Opacity: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <div data-testid="opacity" onClick={onClick} className={className}>
      {children}
    </div>
  ),
}));

// Mock constants to avoid import.meta.env issues
jest.mock("../../../constants/constants", () => ({}));

// Mock hooks and stores
const mockUseEVMWallet = jest.fn();
jest.mock("../../../hooks/useEVMWallet", () => ({
  useEVMWallet: () => mockUseEVMWallet(),
}));

const mockModalStore = jest.fn();
jest.mock("../../../store/modalStore", () => ({
  modalStore: () => mockModalStore(),
  modalNames: {
    transactions: "transactions",
  },
}));

const mockUseGarden = jest.fn();
jest.mock("@gardenfi/react-hooks", () => ({
  useGarden: () => mockUseGarden(),
}));

const mockPendingOrdersStore = jest.fn();
jest.mock("../../../store/pendingOrdersStore", () => ({
  __esModule: true,
  default: () => mockPendingOrdersStore(),
}));

// Mock Loader
jest.mock("../../../common/Loader", () => ({
  Loader: () => <div data-testid="loader">Loader</div>,
}));

describe("Address", () => {
  const mockSetOpenModal = jest.fn();
  const mockSetPendingOrders = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEVMWallet.mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
    });
    mockModalStore.mockReturnValue({
      setOpenModal: mockSetOpenModal,
    });
    mockUseGarden.mockReturnValue({
      pendingOrders: [],
    });
    mockPendingOrdersStore.mockReturnValue({
      pendingOrders: [],
      setPendingOrders: mockSetPendingOrders,
    });
  });

  it("renders address when connected", () => {
    render(<Address />);
    expect(screen.getByTestId("typography")).toHaveTextContent("0x1234...7890");
  });

  it("renders wallet icon on mobile", () => {
    render(<Address />);
    expect(screen.getByTestId("wallet-icon")).toBeInTheDocument();
  });

  it("opens transactions modal when clicked", async () => {
    const user = userEvent.setup();
    render(<Address />);

    const addressElement = screen.getByTestId("opacity");
    await user.click(addressElement);

    expect(mockSetOpenModal).toHaveBeenCalledWith("transactions");
  });

  it("displays pending orders count", () => {
    mockPendingOrdersStore.mockReturnValue({
      pendingOrders: [{ status: "Pending" }, { status: "Processing" }],
      setPendingOrders: mockSetPendingOrders,
    });

    render(<Address />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("does not display pending orders count when zero", () => {
    mockPendingOrdersStore.mockReturnValue({
      pendingOrders: [],
      setPendingOrders: mockSetPendingOrders,
    });

    render(<Address />);
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it("handles missing address gracefully", () => {
    mockUseEVMWallet.mockReturnValue({
      address: null,
    });

    render(<Address />);
    expect(screen.getByTestId("opacity")).toBeInTheDocument();
  });

  it("updates pending orders when useGarden orders change", () => {
    const { rerender } = render(<Address />);

    mockUseGarden.mockReturnValue({
      pendingOrders: [{ id: "1", status: "Pending" }],
    });

    rerender(<Address />);

    expect(mockSetPendingOrders).toHaveBeenCalled();
  });
});
