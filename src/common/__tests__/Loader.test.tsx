import { render, screen } from "../../__tests__/test-utils";
import { Loader } from "../Loader";

// Mock react-lottie-player
jest.mock("react-lottie-player", () => ({
  __esModule: true,
  default: ({ play, speed, style }: any) => (
    <div
      data-testid="lottie-player"
      data-play={play}
      data-speed={speed}
      style={style}
    >
      Lottie Animation
    </div>
  ),
}));

describe("Loader", () => {
  it("renders with default props", () => {
    render(<Loader />);
    const lottiePlayer = screen.getByTestId("lottie-player");
    expect(lottiePlayer).toBeInTheDocument();
    expect(lottiePlayer).toHaveAttribute("data-play", "true");
    expect(lottiePlayer).toHaveAttribute("data-speed", "2");
    expect(lottiePlayer).toHaveStyle({ width: "26px", height: "26px" });
  });

  it("renders with custom width and height", () => {
    render(<Loader width={50} height={50} />);
    const lottiePlayer = screen.getByTestId("lottie-player");
    expect(lottiePlayer).toHaveStyle({ width: "50px", height: "50px" });
  });

  it("renders with custom speed", () => {
    render(<Loader speed={3} />);
    const lottiePlayer = screen.getByTestId("lottie-player");
    expect(lottiePlayer).toHaveAttribute("data-speed", "3");
  });

  it("renders with all custom props", () => {
    render(<Loader width={100} height={100} speed={1.5} />);
    const lottiePlayer = screen.getByTestId("lottie-player");
    expect(lottiePlayer).toHaveStyle({ width: "100px", height: "100px" });
    expect(lottiePlayer).toHaveAttribute("data-speed", "1.5");
  });
});
