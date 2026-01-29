import { render, screen, waitFor } from "../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { Notification } from "../Notification";

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({ children, "data-testid": dataTestId, ...props }: any) => (
    <div data-testid={dataTestId || "typography"} {...props}>
      {children}
    </div>
  ),
  CloseIcon: ({
    onClick,
    className,
  }: {
    onClick?: () => void;
    className?: string;
  }) => (
    <div data-testid="close-icon" onClick={onClick} className={className}>
      CloseIcon
    </div>
  ),
}));

// Mock notificationStore
const mockNotificationStore = jest.fn();
jest.mock("../../store/notificationStore", () => ({
  notificationStore: () => mockNotificationStore(),
}));

// Mock constants to avoid import.meta.env issues
jest.mock("../../constants/constants", () => ({
  LOCAL_STORAGE_KEYS: {
    notification: "notificationId",
  },
}));

// Mock utils
jest.mock("../../utils/utils", () => ({
  calculateNotificationWidth: jest.fn(() => ({
    containerWidth: 400,
    textWidth: 300,
  })),
}));

describe("Notification", () => {
  const mockNotification = {
    id: "test-id",
    title: "Test Title",
    description: "Test Description",
    image: "test-image.png",
    link: "/test-link",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNotificationStore.mockReturnValue({
      notification: null,
    });
  });

  it("renders notification container when notification exists", () => {
    mockNotificationStore.mockReturnValue({
      notification: mockNotification,
    });

    render(<Notification />);

    // The notification container should be rendered
    const container = document.querySelector(".fixed.bottom-10");
    expect(container).toBeInTheDocument();
  });

  it("shows notification content when clicked", async () => {
    const user = userEvent.setup();
    mockNotificationStore.mockReturnValue({
      notification: mockNotification,
    });

    render(<Notification />);

    // Find the notification container and click it
    const notificationContainer = document.querySelector(".fixed.bottom-10");
    if (notificationContainer) {
      await user.click(notificationContainer);
    }

    await waitFor(() => {
      const content = screen.queryByTestId("app-notification-content");
      expect(content).toBeInTheDocument();
      // When visible, it should not have opacity-0
      expect(content).not.toHaveClass("opacity-0");
    });
  });

  it("displays notification title and description when visible", async () => {
    const user = userEvent.setup();
    mockNotificationStore.mockReturnValue({
      notification: mockNotification,
    });

    render(<Notification />);

    // Click to make notification visible
    const notificationContainer = document.querySelector(".fixed.bottom-10");
    if (notificationContainer) {
      await user.click(notificationContainer);
    }

    await waitFor(
      () => {
        // Wait for content to appear
        const title = screen.queryByTestId("app-notification-title");
        const description = screen.queryByTestId(
          "app-notification-description"
        );
        expect(title).toBeInTheDocument();
        expect(description).toBeInTheDocument();
        if (title) expect(title).toHaveTextContent("Test Title");
        if (description)
          expect(description).toHaveTextContent("Test Description");
      },
      { timeout: 3000 }
    );
  });

  it("closes notification when close icon is clicked", async () => {
    const user = userEvent.setup();
    mockNotificationStore.mockReturnValue({
      notification: mockNotification,
    });

    render(<Notification />);

    // Click to make notification visible first
    const notificationContainer = document.querySelector(".fixed.bottom-10");
    if (notificationContainer) {
      await user.click(notificationContainer);
    }

    await waitFor(
      () => {
        const content = screen.queryByTestId("app-notification-content");
        expect(content).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const closeIcon = screen.getByTestId("close-icon");
    if (closeIcon) {
      await user.click(closeIcon);
    }

    await waitFor(
      () => {
        // Check that notification ID was saved to localStorage using the correct key
        const savedId = localStorage.getItem("notificationId");
        expect(savedId).toBe("test-id");
      },
      { timeout: 2000 }
    );
  });

  it("does not show notification if already dismissed", () => {
    localStorage.setItem("notificationId", "test-id");
    mockNotificationStore.mockReturnValue({
      notification: mockNotification,
    });

    render(<Notification />);

    // When dismissed, the notification should not be visible
    // The component checks localStorage and sets visible to false if ID matches
    const content = screen.queryByTestId("app-notification-content");
    // Content might be in DOM but hidden, or not rendered at all
    if (content) {
      // If it exists, it should be hidden
      expect(content).toHaveClass("opacity-0", "pointer-events-none");
    }
    // If it doesn't exist, that's also valid behavior
  });

  it("handles missing notification gracefully", () => {
    mockNotificationStore.mockReturnValue({
      notification: null,
    });

    render(<Notification />);

    expect(
      screen.queryByTestId("app-notification-content")
    ).not.toBeInTheDocument();
  });
});
