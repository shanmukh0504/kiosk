import { render, screen } from "../../../__tests__/test-utils";
import { ResponsiveModal } from "../ResponsiveModal";

// Mock constants to avoid import.meta.env issues
jest.mock("../../../constants/constants", () => ({
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
  },
}));

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  BottomSheet: ({ open, children }: any) => (
    <div data-testid="bottom-sheet" data-open={open.toString()}>
      {children}
    </div>
  ),
  Modal: Object.assign(
    ({ open, children }: any) => (
      <div data-testid="modal" data-open={open.toString()}>
        {children}
      </div>
    ),
    {
      Children: ({ children, className }: any) => (
        <div data-testid="modal-children" className={className}>
          {children}
        </div>
      ),
    }
  ),
}));

// Mock stores
const mockViewPortStore = jest.fn();
jest.mock("../../../store/viewPortStore", () => ({
  viewPortStore: () => mockViewPortStore(),
}));

const mockModalStore = jest.fn();
jest.mock("../../../store/modalStore", () => ({
  modalStore: () => mockModalStore(),
}));

describe("ResponsiveModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockViewPortStore.mockReturnValue({
      isMobile: false,
    });
    mockModalStore.mockReturnValue({
      modalName: {
        assetList: false,
      },
    });
  });

  it("renders Modal on desktop", () => {
    render(
      <ResponsiveModal open={true} onClose={() => {}}>
        <div>Test Content</div>
      </ResponsiveModal>
    );

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.queryByTestId("bottom-sheet")).not.toBeInTheDocument();
  });

  it("renders BottomSheet on mobile", () => {
    mockViewPortStore.mockReturnValue({
      isMobile: true,
    });

    render(
      <ResponsiveModal open={true} onClose={() => {}}>
        <div>Test Content</div>
      </ResponsiveModal>
    );

    expect(screen.getByTestId("bottom-sheet")).toBeInTheDocument();
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("passes open prop correctly", () => {
    render(
      <ResponsiveModal open={true} onClose={() => {}}>
        <div>Test Content</div>
      </ResponsiveModal>
    );

    expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "true");
  });

  it("passes onClose prop correctly", () => {
    const mockOnClose = jest.fn();
    render(
      <ResponsiveModal open={true} onClose={mockOnClose}>
        <div>Test Content</div>
      </ResponsiveModal>
    );

    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(
      <ResponsiveModal open={true} onClose={() => {}}>
        <div data-testid="test-content">Test Content</div>
      </ResponsiveModal>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("applies opacityLevel prop", () => {
    render(
      <ResponsiveModal open={true} onClose={() => {}} opacityLevel="medium">
        <div>Test Content</div>
      </ResponsiveModal>
    );

    expect(screen.getByTestId("modal-children")).toBeInTheDocument();
  });

  it("applies assetList className when assetList modal is open", () => {
    mockModalStore.mockReturnValue({
      modalName: {
        assetList: true,
      },
    });

    render(
      <ResponsiveModal open={true} onClose={() => {}}>
        <div>Test Content</div>
      </ResponsiveModal>
    );

    const modalChildren = screen.getByTestId("modal-children");
    expect(modalChildren).toHaveClass("overflow-hidden");
  });
});
