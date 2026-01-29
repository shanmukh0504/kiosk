import { render } from "../../__tests__/test-utils";
import { ViewPortListener } from "../ViewPortListener";

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

describe("ViewPortListener", () => {
  const mockUpdateViewport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockViewPortStore.mockReturnValue({
      updateViewport: mockUpdateViewport,
    });
  });

  it("calls updateViewport on mount", () => {
    render(<ViewPortListener />);
    expect(mockUpdateViewport).toHaveBeenCalledTimes(1);
  });

  it("adds resize event listener", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    render(<ViewPortListener />);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
    addEventListenerSpy.mockRestore();
  });

  it("calls updateViewport on window resize", () => {
    render(<ViewPortListener />);
    mockUpdateViewport.mockClear();

    window.dispatchEvent(new Event("resize"));

    expect(mockUpdateViewport).toHaveBeenCalled();
  });

  it("removes resize event listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = render(<ViewPortListener />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
    removeEventListenerSpy.mockRestore();
  });

  it("renders nothing", () => {
    const { container } = render(<ViewPortListener />);
    expect(container.firstChild).toBeNull();
  });
});
