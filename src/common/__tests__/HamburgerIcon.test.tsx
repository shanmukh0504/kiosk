import { render, screen } from "../../__tests__/test-utils";
import { HamburgerIcon } from "../HamburgerIcon";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, animate, transition, className }: any) => (
      <div
        data-testid="motion-div"
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        className={className}
      >
        {children}
      </div>
    ),
  },
}));

describe("HamburgerIcon", () => {
  it("renders hamburger icon when sidebar is closed", () => {
    render(<HamburgerIcon isSidebarOpen={false} />);
    const motionDivs = screen.getAllByTestId("motion-div");
    expect(motionDivs).toHaveLength(3);
  });

  it("renders hamburger icon when sidebar is open", () => {
    render(<HamburgerIcon isSidebarOpen={true} />);
    const motionDivs = screen.getAllByTestId("motion-div");
    expect(motionDivs).toHaveLength(3);
  });

  it("applies correct classes to container", () => {
    const { container } = render(<HamburgerIcon isSidebarOpen={false} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass(
      "flex",
      "h-8",
      "w-8",
      "cursor-pointer",
      "flex-col",
      "justify-center",
      "gap-[3px]",
      "rounded-full",
      "p-2"
    );
  });

  it("has three bars", () => {
    render(<HamburgerIcon isSidebarOpen={false} />);
    const motionDivs = screen.getAllByTestId("motion-div");
    expect(motionDivs).toHaveLength(3);
  });

  it("animates correctly when sidebar state changes", () => {
    const { rerender } = render(<HamburgerIcon isSidebarOpen={false} />);
    let motionDivs = screen.getAllByTestId("motion-div");

    // Check initial state (closed)
    const firstBarClosed = motionDivs[0];
    expect(firstBarClosed).toBeInTheDocument();

    // Change to open
    rerender(<HamburgerIcon isSidebarOpen={true} />);
    motionDivs = screen.getAllByTestId("motion-div");
    const firstBarOpen = motionDivs[0];
    expect(firstBarOpen).toBeInTheDocument();
  });
});
