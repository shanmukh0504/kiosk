import { render, screen } from "../../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { AddressDetails } from "../AddressDetails";

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({
    children,
    "data-testid": dataTestId,
    "data-tooltip-id": tooltipId,
    className,
  }: {
    children: React.ReactNode;
    "data-testid"?: string;
    "data-tooltip-id"?: string;
    className?: string;
  }) => (
    <div
      data-testid={dataTestId}
      data-tooltip-id={tooltipId}
      className={className}
    >
      {children}
    </div>
  ),
  EditIcon: ({
    className,
    onClick,
    "data-testid": dataTestId,
  }: {
    className?: string;
    onClick?: () => void;
    "data-testid"?: string;
  }) => (
    <div data-testid={dataTestId} className={className} onClick={onClick}>
      EditIcon
    </div>
  ),
  ArrowNorthEastIcon: ({
    className,
    "data-testid": dataTestId,
  }: {
    className?: string;
    "data-testid"?: string;
  }) => (
    <div data-testid={dataTestId} className={className}>
      ArrowNorthEastIcon
    </div>
  ),
}));

// Mock Tooltip
jest.mock("../../../common/Tooltip", () => ({
  Tooltip: ({
    id,
    place,
    content,
    multiline,
  }: {
    id: string;
    place?: string;
    content?: string;
    multiline?: boolean;
  }) => (
    <div
      data-testid={`tooltip-${id}`}
      data-place={place}
      data-content={content}
      data-multiline={multiline}
    >
      Tooltip
    </div>
  ),
}));

// Mock utils
jest.mock("../../../utils/getTrimmedAddress", () => ({
  getTrimmedAddress: jest.fn(
    (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`
  ),
}));

// Mock stores
const mockAssetInfoStore = jest.fn();
jest.mock("../../../store/assetInfoStore", () => ({
  assetInfoStore: () => mockAssetInfoStore(),
}));

const mockSwapStore = jest.fn();
jest.mock("../../../store/swapStore", () => ({
  swapStore: () => mockSwapStore(),
}));

// Mock @gardenfi/orderbook
jest.mock("@gardenfi/orderbook", () => ({
  isBitcoin: jest.fn(
    (chain: string) => chain === "bitcoin" || chain === "bitcoin_testnet"
  ),
}));

// Mock @gardenfi/utils
jest.mock("@gardenfi/utils", () => ({
  Url: jest.fn().mockImplementation((type: string, baseUrl: string) => ({
    endpoint: (address: string) => `${baseUrl}/${address}`,
  })),
}));

describe("AddressDetails", () => {
  const mockSetUserProvidedAddress = jest.fn();
  const mockSetIsEditAddress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.open = jest.fn();

    mockAssetInfoStore.mockReturnValue({
      chains: {
        bitcoin: {
          explorer_url: "https://blockstream.info",
        },
        ethereum: {
          explorer_url: "https://etherscan.io",
        },
      },
    });

    mockSwapStore.mockReturnValue({
      inputAsset: {
        chain: "bitcoin",
      },
      outputAsset: {
        chain: "ethereum",
      },
      isEditAddress: {
        source: false,
        destination: false,
      },
      setUserProvidedAddress: mockSetUserProvidedAddress,
      setIsEditAddress: mockSetIsEditAddress,
    });
  });

  it("renders receive address when isRefund is false", () => {
    render(
      <AddressDetails address="0x1234567890123456789012345678901234567890" />
    );

    expect(
      screen.getByTestId("swap-details-receive-address-row")
    ).toBeInTheDocument();
    expect(screen.getByText("Receive address")).toBeInTheDocument();
    expect(
      screen.getByTestId("swap-details-receive-address-value")
    ).toBeInTheDocument();
  });

  it("renders refund address when isRefund is true", () => {
    render(
      <AddressDetails
        address="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
        isRefund
      />
    );

    expect(
      screen.getByTestId("swap-details-refund-address-row")
    ).toBeInTheDocument();
    expect(screen.getByText("Refund address")).toBeInTheDocument();
    expect(
      screen.getByTestId("swap-details-refund-address-value")
    ).toBeInTheDocument();
  });

  it("displays trimmed address", () => {
    const address = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
    render(<AddressDetails address={address} />);

    const addressValue = screen.getByTestId(
      "swap-details-receive-address-value"
    );
    // The mock returns first 6 chars + ... + last 4 chars
    expect(addressValue.textContent).toContain("bc1qxy");
    expect(addressValue.textContent).toContain("0wlh");
  });

  it("opens explorer when address row is clicked", async () => {
    const user = userEvent.setup();
    const address = "0x1234567890123456789012345678901234567890";
    render(<AddressDetails address={address} />);

    const addressRow = screen.getByTestId("swap-details-receive-address-row");
    await user.click(addressRow);

    expect(global.open).toHaveBeenCalledWith(
      "https://etherscan.io/0x1234567890123456789012345678901234567890",
      "_blank"
    );
  });

  it("shows edit icon for Bitcoin refund addresses when not editing", () => {
    mockSwapStore.mockReturnValue({
      inputAsset: {
        chain: "bitcoin",
      },
      outputAsset: {
        chain: "ethereum",
      },
      isEditAddress: {
        source: false,
        destination: false,
      },
      setUserProvidedAddress: mockSetUserProvidedAddress,
      setIsEditAddress: mockSetIsEditAddress,
    });

    render(
      <AddressDetails
        address="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
        isRefund
      />
    );

    expect(
      screen.getByTestId("swap-details-refund-address-edit")
    ).toBeInTheDocument();
  });

  it("hides edit icon when editing", () => {
    mockSwapStore.mockReturnValue({
      inputAsset: {
        chain: "bitcoin",
      },
      outputAsset: {
        chain: "ethereum",
      },
      isEditAddress: {
        source: true,
        destination: false,
      },
      setUserProvidedAddress: mockSetUserProvidedAddress,
      setIsEditAddress: mockSetIsEditAddress,
    });

    render(
      <AddressDetails
        address="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
        isRefund
      />
    );

    expect(
      screen.queryByTestId("swap-details-refund-address-edit")
    ).not.toBeInTheDocument();
  });

  it("calls setUserProvidedAddress and setIsEditAddress when edit icon is clicked", async () => {
    const user = userEvent.setup();
    mockSwapStore.mockReturnValue({
      inputAsset: {
        chain: "bitcoin",
      },
      outputAsset: {
        chain: "ethereum",
      },
      isEditAddress: {
        source: false,
        destination: false,
      },
      setUserProvidedAddress: mockSetUserProvidedAddress,
      setIsEditAddress: mockSetIsEditAddress,
    });

    const address = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
    render(<AddressDetails address={address} isRefund />);

    const editIcon = screen.getByTestId("swap-details-refund-address-edit");
    await user.click(editIcon);

    expect(mockSetUserProvidedAddress).toHaveBeenCalledWith({
      source: address,
    });
    expect(mockSetIsEditAddress).toHaveBeenCalledWith({
      source: true,
      destination: false,
    });
  });

  it("renders tooltip for refund addresses", () => {
    render(
      <AddressDetails
        address="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
        isRefund
      />
    );

    const tooltip = screen.getByTestId(/tooltip-/);
    expect(tooltip).toBeInTheDocument();
  });

  it("does not render address row when address is missing", () => {
    mockSwapStore.mockReturnValue({
      inputAsset: {
        chain: "bitcoin",
      },
      outputAsset: {
        chain: "ethereum",
      },
      isEditAddress: {
        source: false,
        destination: false,
      },
      setUserProvidedAddress: mockSetUserProvidedAddress,
      setIsEditAddress: mockSetIsEditAddress,
    });

    render(<AddressDetails address="" />);
    expect(
      screen.queryByTestId("swap-details-receive-address-row")
    ).not.toBeInTheDocument();
  });

  it("does not render address row when chain is missing", () => {
    mockSwapStore.mockReturnValue({
      inputAsset: null,
      outputAsset: null,
      isEditAddress: {
        source: false,
        destination: false,
      },
      setUserProvidedAddress: mockSetUserProvidedAddress,
      setIsEditAddress: mockSetIsEditAddress,
    });

    render(<AddressDetails address="0x123" />);
    expect(
      screen.queryByTestId("swap-details-receive-address-row")
    ).not.toBeInTheDocument();
  });
});
