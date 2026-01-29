import { render, screen } from "../../../__tests__/test-utils";
import { FeaturedQuest } from "../FeaturedQuest";

// Mock Quest component
jest.mock("../Quest", () => ({
  Quest: ({
    partner,
    description,
    logo,
    amount,
    link,
    logoLink,
    featured,
  }: {
    partner: string;
    description: string;
    logo: React.ReactNode;
    amount: number;
    link?: string;
    logoLink: string;
    featured: boolean;
  }) => (
    <div
      data-testid="quest"
      data-partner={partner}
      data-amount={amount}
      data-featured={featured}
    >
      <div data-testid="quest-description">{description}</div>
      <div data-testid="quest-logo-link">{logoLink}</div>
      {link && <div data-testid="quest-link">{link}</div>}
      {logo}
    </div>
  ),
}));

describe("FeaturedQuest", () => {
  const mockLogo = <div data-testid="featured-logo">Logo</div>;
  const defaultProps = {
    image: "featured-image.png",
    partner: "Featured Partner",
    description: "This is a featured quest description",
    logo: mockLogo,
    amount: 100,
    logoLink: "/partner-link",
  };

  it("renders featured quest image", () => {
    render(<FeaturedQuest {...defaultProps} />);
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", "featured-image.png");
  });

  it("renders Quest component with correct props", () => {
    render(<FeaturedQuest {...defaultProps} />);
    const quest = screen.getByTestId("quest");
    expect(quest).toHaveAttribute("data-partner", "Featured Partner");
    expect(quest).toHaveAttribute("data-amount", "100");
    expect(quest).toHaveAttribute("data-featured", "true");
  });

  it("passes description to Quest component", () => {
    render(<FeaturedQuest {...defaultProps} />);
    expect(screen.getByTestId("quest-description")).toHaveTextContent(
      "This is a featured quest description"
    );
  });

  it("passes logoLink to Quest component", () => {
    render(<FeaturedQuest {...defaultProps} />);
    expect(screen.getByTestId("quest-logo-link")).toHaveTextContent(
      "/partner-link"
    );
  });

  it("passes optional link to Quest component", () => {
    render(<FeaturedQuest {...defaultProps} link="/quest-link" />);
    expect(screen.getByTestId("quest-link")).toHaveTextContent("/quest-link");
  });

  it("does not render link when not provided", () => {
    render(<FeaturedQuest {...defaultProps} />);
    expect(screen.queryByTestId("quest-link")).not.toBeInTheDocument();
  });

  it("applies correct className to container", () => {
    const { container } = render(<FeaturedQuest {...defaultProps} />);
    const containerElement = container.firstChild;
    expect(containerElement).toHaveClass(
      "flex",
      "flex-col",
      "gap-6",
      "rounded-2xl",
      "bg-white/30",
      "p-6",
      "backdrop-blur-[20px]"
    );
  });

  it("renders with different amounts", () => {
    const { rerender } = render(
      <FeaturedQuest {...defaultProps} amount={50} />
    );
    let quest = screen.getByTestId("quest");
    expect(quest).toHaveAttribute("data-amount", "50");

    rerender(<FeaturedQuest {...defaultProps} amount={200} />);
    quest = screen.getByTestId("quest");
    expect(quest).toHaveAttribute("data-amount", "200");
  });
});
