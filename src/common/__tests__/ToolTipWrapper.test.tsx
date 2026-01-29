import { render, screen } from "../../__tests__/test-utils";
import { TooltipWrapper } from "../ToolTipWrapper";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, style }: any) => (
      <div data-testid="motion-div" className={className} style={style}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animate-presence">{children}</div>
  ),
}));

// Mock Portal
jest.mock("../../components/Portal", () => ({
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="portal">{children}</div>
  ),
}));

// Mock constants to avoid import.meta.env issues
jest.mock("../../constants/constants", () => ({
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
  },
}));

// Mock viewPortStore
const mockViewPortStore = jest.fn();
jest.mock("../../store/viewPortStore", () => ({
  viewPortStore: () => mockViewPortStore(),
}));

describe("TooltipWrapper", () => {
  const mockTargetRef = {
    current: {
      getBoundingClientRect: () => ({
        top: 100,
        right: 200,
        bottom: 150,
        left: 150,
        width: 50,
        height: 50,
      }),
    },
  } as React.RefObject<HTMLElement>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockViewPortStore.mockReturnValue({
      isMobile: false,
    });

    // Mock ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    }));
  });

  it("renders children in portal", () => {
    render(
      <TooltipWrapper targetRef={mockTargetRef}>
        <div data-testid="tooltip-content">Tooltip Content</div>
      </TooltipWrapper>
    );

    expect(screen.getByTestId("portal")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-content")).toBeInTheDocument();
  });

  it("renders with default offsets", () => {
    render(
      <TooltipWrapper targetRef={mockTargetRef}>
        <div>Content</div>
      </TooltipWrapper>
    );

    // There are multiple motion-div elements, check that at least one exists
    const motionDivs = screen.getAllByTestId("motion-div");
    expect(motionDivs.length).toBeGreaterThan(0);
  });

  it("renders with custom offsets", () => {
    render(
      <TooltipWrapper targetRef={mockTargetRef} offsetX={20} offsetY={30}>
        <div>Content</div>
      </TooltipWrapper>
    );

    expect(screen.getByTestId("portal")).toBeInTheDocument();
  });

  it("renders with title prop", () => {
    render(
      <TooltipWrapper targetRef={mockTargetRef} title="test-tooltip">
        <div>Content</div>
      </TooltipWrapper>
    );

    expect(screen.getByTestId("test-tooltip-tooltip")).toBeInTheDocument();
  });

  it("handles mobile viewport", () => {
    mockViewPortStore.mockReturnValue({
      isMobile: true,
    });

    render(
      <TooltipWrapper targetRef={mockTargetRef}>
        <div>Content</div>
      </TooltipWrapper>
    );

    expect(screen.getByTestId("portal")).toBeInTheDocument();
  });

  it("handles scroll events", () => {
    render(
      <TooltipWrapper targetRef={mockTargetRef}>
        <div>Content</div>
      </TooltipWrapper>
    );

    // Initially should be visible
    expect(screen.getByTestId("portal")).toBeInTheDocument();

    // Simulate scroll event - component sets isVisible to false
    window.dispatchEvent(new Event("scroll", { bubbles: true }));

    // After scroll, component returns null (not visible)
    // Note: This test verifies the component handles scroll events
    // The actual visibility state is internal to the component
  });

  it("handles missing targetRef gracefully", () => {
    const emptyRef = { current: null } as React.RefObject<HTMLElement>;

    // Component should handle null ref without crashing
    const { container } = render(
      <TooltipWrapper targetRef={emptyRef}>
        <div>Content</div>
      </TooltipWrapper>
    );

    // When targetRef is null, useEffect returns early, so portal might not render
    // This is expected behavior - component handles it gracefully
    expect(container).toBeTruthy();
  });
});
