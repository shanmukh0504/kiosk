import { render, screen } from "../../__tests__/test-utils";
import { Tooltip } from "../Tooltip";

// Mock react-tooltip
jest.mock("react-tooltip", () => ({
  Tooltip: ({ id, place, content, className }: any) => (
    <div
      data-testid="react-tooltip"
      data-id={id}
      data-place={place}
      data-content={content}
      className={className}
    >
      Tooltip
    </div>
  ),
}));

// Mock @gardenfi/garden-book Typography
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="typography">{children}</div>
  ),
}));

describe("Tooltip", () => {
  it("renders tooltip with default props", () => {
    render(<Tooltip />);
    const tooltip = screen.getByTestId("react-tooltip");
    expect(tooltip).toBeInTheDocument();
  });

  it("renders tooltip with id", () => {
    render(<Tooltip id="test-tooltip" />);
    const tooltip = screen.getByTestId("react-tooltip");
    expect(tooltip).toHaveAttribute("data-id", "test-tooltip");
  });

  it("renders tooltip with place prop", () => {
    render(<Tooltip place="top" />);
    const tooltip = screen.getByTestId("react-tooltip");
    expect(tooltip).toHaveAttribute("data-place", "top");
  });

  it("renders tooltip with content", () => {
    render(<Tooltip content="Test tooltip content" />);
    const tooltip = screen.getByTestId("react-tooltip");
    expect(tooltip).toHaveAttribute("data-content", "Test tooltip content");
  });

  it("applies multiline class when multiline is true", () => {
    render(<Tooltip multiline />);
    const tooltip = screen.getByTestId("react-tooltip");
    expect(tooltip).toHaveClass("multiline");
  });

  it("does not apply multiline class when multiline is false", () => {
    render(<Tooltip multiline={false} />);
    const tooltip = screen.getByTestId("react-tooltip");
    expect(tooltip).not.toHaveClass("multiline");
  });

  it("renders with all props", () => {
    render(
      <Tooltip
        id="custom-tooltip"
        place="bottom"
        content="Custom content"
        multiline
      />
    );
    const tooltip = screen.getByTestId("react-tooltip");
    expect(tooltip).toHaveAttribute("data-id", "custom-tooltip");
    expect(tooltip).toHaveAttribute("data-place", "bottom");
    expect(tooltip).toHaveAttribute("data-content", "Custom content");
    expect(tooltip).toHaveClass("multiline");
  });
});
