import { render, screen, waitFor } from "../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { CopyToClipboard } from "../CopyToClipboard";

// Mock @gardenfi/garden-book icons
jest.mock("@gardenfi/garden-book", () => ({
  CheckIcon: ({ className }: { className?: string }) => (
    <div data-testid="check-icon" className={className}>
      CheckIcon
    </div>
  ),
  CopyIcon: ({
    className,
    onClick,
  }: {
    className?: string;
    onClick?: () => void;
  }) => (
    <div data-testid="copy-icon" className={className} onClick={onClick}>
      CopyIcon
    </div>
  ),
}));

describe("CopyToClipboard", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders copy icon initially", () => {
    render(<CopyToClipboard text="test text" />);
    expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  it("copies text to clipboard when clicked", async () => {
    const user = userEvent.setup({ delay: null });
    const writeTextSpy = jest.spyOn(navigator.clipboard, "writeText");
    render(<CopyToClipboard text="test text" />);

    const copyIcon = screen.getByTestId("copy-icon");
    await user.click(copyIcon);

    expect(writeTextSpy).toHaveBeenCalledWith("test text");
    writeTextSpy.mockRestore();
  });

  it("shows check icon after copying", async () => {
    const user = userEvent.setup({ delay: null });
    render(<CopyToClipboard text="test text" />);

    const copyIcon = screen.getByTestId("copy-icon");
    await user.click(copyIcon);

    await waitFor(() => {
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("copy-icon")).not.toBeInTheDocument();
  });

  it("reverts to copy icon after 1.5 seconds", async () => {
    const user = userEvent.setup({ delay: null });
    render(<CopyToClipboard text="test text" />);

    const copyIcon = screen.getByTestId("copy-icon");
    await user.click(copyIcon);

    await waitFor(() => {
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  it("applies correct className to copy icon", () => {
    render(<CopyToClipboard text="test text" />);
    const copyIcon = screen.getByTestId("copy-icon");
    expect(copyIcon).toHaveClass("h-4", "w-4", "cursor-pointer");
  });

  it("applies correct className to check icon", async () => {
    const user = userEvent.setup({ delay: null });
    render(<CopyToClipboard text="test text" />);

    const copyIcon = screen.getByTestId("copy-icon");
    await user.click(copyIcon);

    await waitFor(() => {
      const checkIcon = screen.getByTestId("check-icon");
      expect(checkIcon).toHaveClass("h-3", "w-6");
    });
  });
});
