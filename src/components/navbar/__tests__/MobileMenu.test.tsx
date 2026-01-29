import { render, screen } from "../../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { MobileMenu } from "../MobileMenu";

// Mock @gardenfi/garden-book
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({
    children,
    weight,
  }: {
    children: React.ReactNode;
    weight?: string;
  }) => (
    <div data-testid="typography" data-weight={weight}>
      {children}
    </div>
  ),
  BottomSheet: ({ open, children, onOpenChange }: any) => (
    <div data-testid="bottom-sheet" data-open={open.toString()}>
      {children}
      {open && <button onClick={() => onOpenChange(false)}>Close</button>}
    </div>
  ),
  DiscordIcon: () => <div data-testid="discord-icon">DiscordIcon</div>,
  XIcon: () => <div data-testid="x-icon">XIcon</div>,
}));

// Mock HamburgerIcon
jest.mock("../../../common/HamburgerIcon", () => ({
  HamburgerIcon: ({ isSidebarOpen }: { isSidebarOpen: boolean }) => (
    <div data-testid="hamburger-icon" data-open={isSidebarOpen.toString()}>
      HamburgerIcon
    </div>
  ),
}));

// Mock constants to avoid import.meta.env issues
jest.mock("../../../constants/constants", () => ({
  routes: [
    ["swap", { name: "Swap", path: ["/swap"], isExternal: false }],
    ["stake", { name: "Stake", path: ["/stake"], isExternal: false }],
  ],
  externalRoutes: [["docs", { name: "Docs", path: "/docs", isExternal: true }]],
  SOCIAL_LINKS: {
    discord: "/discord",
    x: "/x",
  },
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
  },
}));

// Mock MenuNotification
jest.mock("../../../common/MenuNotification", () => ({
  MenuNotification: () => (
    <div data-testid="menu-notification">MenuNotification</div>
  ),
}));

// Mock notificationStore
const mockNotificationStore = jest.fn();
jest.mock("../../../store/notificationStore", () => ({
  notificationStore: () => mockNotificationStore(),
}));

// Mock utils
jest.mock("../../../utils/utils", () => ({
  isCurrentRoute: jest.fn((path: string) => path === "/swap"),
}));

describe("MobileMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotificationStore.mockReturnValue({
      notification: null,
    });
  });

  it("renders hamburger icon button", () => {
    render(<MobileMenu />);
    expect(screen.getByTestId("navbar-mobile-menu-button")).toBeInTheDocument();
    expect(screen.getByTestId("hamburger-icon")).toBeInTheDocument();
  });

  it("opens sidebar when button is clicked", async () => {
    const user = userEvent.setup();
    render(<MobileMenu />);

    const button = screen.getByTestId("navbar-mobile-menu-button");
    await user.click(button);

    expect(screen.getByTestId("bottom-sheet")).toHaveAttribute(
      "data-open",
      "true"
    );
  });

  it("closes sidebar when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<MobileMenu />);

    const button = screen.getByTestId("navbar-mobile-menu-button");
    await user.click(button);

    expect(screen.getByTestId("bottom-sheet")).toHaveAttribute(
      "data-open",
      "true"
    );

    const closeButton = screen.getByText("Close");
    await user.click(closeButton);

    expect(screen.getByTestId("bottom-sheet")).toHaveAttribute(
      "data-open",
      "false"
    );
  });

  it("renders routes", () => {
    render(<MobileMenu />);
    expect(screen.getByText("Swap")).toBeInTheDocument();
    expect(screen.getByText("Stake")).toBeInTheDocument();
  });

  it("renders external routes", () => {
    render(<MobileMenu />);
    expect(screen.getByText("Docs")).toBeInTheDocument();
  });

  it("renders social media icons", () => {
    render(<MobileMenu />);
    expect(screen.getByTestId("discord-icon")).toBeInTheDocument();
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("renders notification when available", async () => {
    const user = userEvent.setup();
    mockNotificationStore.mockReturnValue({
      notification: {
        id: "1",
        title: "Test",
        description: "Test",
        image: "test.png",
        link: "/test",
      },
    });

    render(<MobileMenu />);
    const button = screen.getByTestId("navbar-mobile-menu-button");
    await user.click(button);

    // Notification should be rendered when sidebar is open
    expect(screen.queryByTestId("menu-notification")).toBeInTheDocument();
  });

  it("applies active weight to current route", () => {
    render(<MobileMenu />);
    const typographyElements = screen.getAllByTestId("typography");
    const swapTypography = typographyElements.find(
      (el: HTMLElement) => el.textContent === "Swap"
    );
    expect(swapTypography).toHaveAttribute("data-weight", "medium");
  });
});
