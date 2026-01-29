import { render } from "../../../__tests__/test-utils";
import { SwapInProgressSkeleton } from "../swapInProgress/SwapInProgressSkeleton";

describe("SwapInProgressSkeleton", () => {
  it("renders skeleton loading elements", () => {
    const { container } = render(<SwapInProgressSkeleton />);

    // Check for skeleton elements with animate-pulse class
    const skeletonElements = container.querySelectorAll(".animate-pulse");
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("renders multiple skeleton placeholders", () => {
    const { container } = render(<SwapInProgressSkeleton />);

    // Should have skeleton placeholders for different sections
    const placeholders = container.querySelectorAll(".bg-gray-200");
    expect(placeholders.length).toBeGreaterThanOrEqual(4);
  });

  it("has correct container structure", () => {
    const { container } = render(<SwapInProgressSkeleton />);
    const mainContainer = container.firstChild;

    expect(mainContainer).toHaveClass(
      "flex",
      "flex-col",
      "gap-3",
      "p-3",
      "animate-pulse"
    );
  });

  it("renders header skeleton", () => {
    const { container } = render(<SwapInProgressSkeleton />);
    const header = container.querySelector(".h-6");
    expect(header).toBeInTheDocument();
  });

  it("renders card skeletons with rounded corners", () => {
    const { container } = render(<SwapInProgressSkeleton />);
    const cards = container.querySelectorAll(".rounded-2xl");
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });
});
