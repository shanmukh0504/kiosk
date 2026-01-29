import { render, screen } from "../../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { ToastContainer } from "../Toast";

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({
    children,
    "data-testid": dataTestId,
    ...props
  }: {
    children: React.ReactNode;
    "data-testid"?: string;
    [key: string]: any;
  }) => (
    <div data-testid={dataTestId} {...props}>
      {children}
    </div>
  ),
  Button: ({
    children,
    onClick,
    "data-testid": dataTestId,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    "data-testid"?: string;
    [key: string]: any;
  }) => (
    <button data-testid={dataTestId} onClick={onClick} {...props}>
      {children}
    </button>
  ),
  CheckIcon: () => <div data-testid="check-icon">CheckIcon</div>,
  InfoIcon: ({ className }: { className?: string }) => (
    <div data-testid="info-icon" className={className}>
      InfoIcon
    </div>
  ),
  CloseIcon: () => <div data-testid="close-icon">CloseIcon</div>,
  ArrowNorthEastIcon: () => (
    <div data-testid="arrow-icon">ArrowNorthEastIcon</div>
  ),
  GardenIconOutline: ({ className }: { className?: string }) => (
    <div data-testid="garden-icon" className={className}>
      GardenIconOutline
    </div>
  ),
}));

// Mock toastStore
const mockUseToastStore = jest.fn();
jest.mock("../../../store/toastStore", () => ({
  useToastStore: () => mockUseToastStore(),
}));

describe("ToastContainer", () => {
  const mockHideToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseToastStore.mockReturnValue({
      isVisible: false,
      content: "",
      link: undefined,
      type: "success",
      hideToast: mockHideToast,
      staticToasts: {
        needSeed: {
          content: "",
          isVisible: false,
          link: undefined,
        },
      },
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders nothing when not visible and no static toast", () => {
    render(<ToastContainer />);
    expect(screen.queryByTestId("toast-success")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("toast-static-need-seed")
    ).not.toBeInTheDocument();
  });

  it("renders success toast when visible", () => {
    mockUseToastStore.mockReturnValue({
      isVisible: true,
      content: "Success message",
      link: undefined,
      type: "success",
      hideToast: mockHideToast,
      staticToasts: {
        needSeed: {
          content: "",
          isVisible: false,
          link: undefined,
        },
      },
    });

    render(<ToastContainer />);
    expect(screen.getByTestId("toast-success")).toBeInTheDocument();
    expect(screen.getByTestId("toast-success-content")).toHaveTextContent(
      "Success message"
    );
    expect(screen.getByTestId("toast-success-icon")).toBeInTheDocument();
  });

  it("renders error toast when visible", () => {
    mockUseToastStore.mockReturnValue({
      isVisible: true,
      content: "Error message",
      link: undefined,
      type: "error",
      hideToast: mockHideToast,
      staticToasts: {
        needSeed: {
          content: "",
          isVisible: false,
          link: undefined,
        },
      },
    });

    render(<ToastContainer />);
    expect(screen.getByTestId("toast-error")).toBeInTheDocument();
    expect(screen.getByTestId("toast-error-content")).toHaveTextContent(
      "Error message"
    );
    expect(screen.getByTestId("toast-error-icon")).toBeInTheDocument();
  });

  it("renders link icon when link is provided", () => {
    mockUseToastStore.mockReturnValue({
      isVisible: true,
      content: "Success message",
      link: "/test-link",
      type: "success",
      hideToast: mockHideToast,
      staticToasts: {
        needSeed: {
          content: "",
          isVisible: false,
          link: undefined,
        },
      },
    });

    render(<ToastContainer />);
    expect(screen.getByTestId("toast-success-link-icon")).toBeInTheDocument();
  });

  it("renders close button when no link is provided", () => {
    mockUseToastStore.mockReturnValue({
      isVisible: true,
      content: "Success message",
      link: undefined,
      type: "success",
      hideToast: mockHideToast,
      staticToasts: {
        needSeed: {
          content: "",
          isVisible: false,
          link: undefined,
        },
      },
    });

    render(<ToastContainer />);
    const closeButton = screen.getByRole("button", { name: /close toast/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("calls hideToast when close button is clicked", async () => {
    const user = userEvent.setup({ delay: null });
    mockUseToastStore.mockReturnValue({
      isVisible: true,
      content: "Success message",
      link: undefined,
      type: "success",
      hideToast: mockHideToast,
      staticToasts: {
        needSeed: {
          content: "",
          isVisible: false,
          link: undefined,
        },
      },
    });

    render(<ToastContainer />);
    const closeButton = screen.getByRole("button", { name: /close toast/i });
    await user.click(closeButton);

    expect(mockHideToast).toHaveBeenCalled();
  });

  it("auto-hides success toast after 10 seconds", () => {
    mockUseToastStore.mockReturnValue({
      isVisible: true,
      content: "Success message",
      link: undefined,
      type: "success",
      hideToast: mockHideToast,
      staticToasts: {
        needSeed: {
          content: "",
          isVisible: false,
          link: undefined,
        },
      },
    });

    render(<ToastContainer />);
    expect(mockHideToast).not.toHaveBeenCalled();

    jest.advanceTimersByTime(10000);
    expect(mockHideToast).toHaveBeenCalled();
  });

  it("renders static needSeed toast when visible", () => {
    mockUseToastStore.mockReturnValue({
      isVisible: false,
      content: "",
      link: undefined,
      type: "success",
      hideToast: mockHideToast,
      staticToasts: {
        needSeed: {
          content: "Need SEED token",
          isVisible: true,
          link: "/buy-seed",
        },
      },
    });

    render(<ToastContainer />);
    expect(screen.getByTestId("toast-static-need-seed")).toBeInTheDocument();
    expect(
      screen.getByTestId("toast-static-need-seed-content")
    ).toHaveTextContent("Need SEED token");
  });

  it("renders CTA button in static toast when link is provided", () => {
    mockUseToastStore.mockReturnValue({
      isVisible: false,
      content: "",
      link: undefined,
      type: "success",
      hideToast: mockHideToast,
      staticToasts: {
        needSeed: {
          content: "Need SEED token",
          isVisible: true,
          link: "/buy-seed",
        },
      },
    });

    render(<ToastContainer />);
    expect(
      screen.getByTestId("toast-static-need-seed-cta")
    ).toBeInTheDocument();
    expect(screen.getByTestId("toast-static-need-seed-cta")).toHaveTextContent(
      "Buy SEED"
    );
  });
});
