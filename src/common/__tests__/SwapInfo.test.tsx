import { render, screen } from "../../__tests__/test-utils";
import { SwapInfo } from "../SwapInfo";

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="typography">{children}</div>
  ),
  ArrowRightIcon: ({ className }: { className?: string }) => (
    <div data-testid="arrow-icon" className={className}>
      ArrowRightIcon
    </div>
  ),
  TokenNetworkLogos: ({
    tokenLogo,
    chainLogo,
  }: {
    tokenLogo: string;
    chainLogo?: string;
  }) => (
    <div
      data-testid="token-network-logos"
      data-token={tokenLogo}
      data-chain={chainLogo}
    >
      TokenNetworkLogos
    </div>
  ),
}));

// Mock constants to avoid import.meta.env issues
jest.mock("../../constants/constants", () => ({}));

// Mock assetInfoStore
const mockAssetInfoStore = jest.fn();
jest.mock("../../store/assetInfoStore", () => ({
  assetInfoStore: () => mockAssetInfoStore(),
}));

describe("SwapInfo", () => {
  const mockSendAsset = {
    chain: "ethereum",
    icon: "send-icon.png",
  } as any;

  const mockReceiveAsset = {
    chain: "bitcoin",
    icon: "receive-icon.png",
  } as any;

  beforeEach(() => {
    mockAssetInfoStore.mockReturnValue({
      chains: {
        ethereum: { icon: "eth-chain.png" },
        bitcoin: { icon: "btc-chain.png" },
      },
    });
  });

  it("renders send and receive amounts", () => {
    render(
      <SwapInfo
        sendAsset={mockSendAsset}
        receiveAsset={mockReceiveAsset}
        sendAmount="100"
        receiveAmount="200"
      />
    );

    const typographyElements = screen.getAllByTestId("typography");
    expect(typographyElements[0]).toHaveTextContent("100");
    expect(typographyElements[1]).toHaveTextContent("200");
  });

  it("renders arrow icon", () => {
    render(
      <SwapInfo
        sendAsset={mockSendAsset}
        receiveAsset={mockReceiveAsset}
        sendAmount="100"
        receiveAmount="200"
      />
    );

    expect(screen.getByTestId("arrow-icon")).toBeInTheDocument();
  });

  it("renders token network logos for both assets", () => {
    render(
      <SwapInfo
        sendAsset={mockSendAsset}
        receiveAsset={mockReceiveAsset}
        sendAmount="100"
        receiveAmount="200"
      />
    );

    const logos = screen.getAllByTestId("token-network-logos");
    expect(logos).toHaveLength(2);
    expect(logos[0]).toHaveAttribute("data-token", "send-icon.png");
    expect(logos[1]).toHaveAttribute("data-token", "receive-icon.png");
  });

  it("handles equalSplit prop", () => {
    const { container } = render(
      <SwapInfo
        sendAsset={mockSendAsset}
        receiveAsset={mockReceiveAsset}
        sendAmount="100"
        receiveAmount="200"
        equalSplit
      />
    );

    const flexContainers = container.querySelectorAll(".flex");
    expect(flexContainers.length).toBeGreaterThan(0);
  });

  it("handles missing chain info gracefully", () => {
    mockAssetInfoStore.mockReturnValue({
      chains: null,
    });

    render(
      <SwapInfo
        sendAsset={mockSendAsset}
        receiveAsset={mockReceiveAsset}
        sendAmount="100"
        receiveAmount="200"
      />
    );

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
  });

  it("handles numeric amounts", () => {
    render(
      <SwapInfo
        sendAsset={mockSendAsset}
        receiveAsset={mockReceiveAsset}
        sendAmount={100}
        receiveAmount={200}
      />
    );

    const typographyElements = screen.getAllByTestId("typography");
    expect(typographyElements[0]).toHaveTextContent("100");
    expect(typographyElements[1]).toHaveTextContent("200");
  });
});
