import { render, screen } from "../../__tests__/test-utils";
import { MenuNotification } from "../MenuNotification";

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({
    children,
    size,
    weight,
    className,
  }: {
    children: React.ReactNode;
    size?: string;
    weight?: string;
    className?: string;
  }) => (
    <div
      data-testid="typography"
      data-size={size}
      data-weight={weight}
      className={className}
    >
      {children}
    </div>
  ),
}));

describe("MenuNotification", () => {
  const mockNotification = {
    id: "1",
    title: "Test Notification",
    description: "This is a test notification description",
    image: "test-image.png",
    link: "/test-link",
  };

  it("renders notification with all props", () => {
    render(<MenuNotification notification={mockNotification} />);

    expect(screen.getByText("Test Notification")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test notification description")
    ).toBeInTheDocument();
  });

  it("renders notification image", () => {
    render(<MenuNotification notification={mockNotification} />);

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", "test-image.png");
    expect(image).toHaveClass("h-16", "w-16", "rounded-lg", "object-cover");
  });

  it("renders links with correct href", () => {
    render(<MenuNotification notification={mockNotification} />);

    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("href", "/test-link");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  it("renders title with correct typography props", () => {
    render(<MenuNotification notification={mockNotification} />);

    const typographyElements = screen.getAllByTestId("typography");
    const titleElement = typographyElements.find((el) =>
      el.textContent?.includes("Test Notification")
    );
    expect(titleElement).toHaveAttribute("data-size", "h5");
    expect(titleElement).toHaveAttribute("data-weight", "bold");
  });

  it("renders description with correct typography props", () => {
    render(<MenuNotification notification={mockNotification} />);

    const typographyElements = screen.getAllByTestId("typography");
    const descriptionElement = typographyElements.find((el) =>
      el.textContent?.includes("This is a test notification description")
    );
    expect(descriptionElement).toHaveAttribute("data-weight", "medium");
  });

  it("handles long descriptions", () => {
    const longDescription = "A".repeat(200);
    const notificationWithLongDesc = {
      ...mockNotification,
      description: longDescription,
    };

    render(<MenuNotification notification={notificationWithLongDesc} />);

    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });
});
