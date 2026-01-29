import { render, screen } from "../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { Switch } from "../Switch";

// Mock @gardenfi/garden-book Typography
jest.mock("@gardenfi/garden-book", () => ({
  Typography: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <div onClick={onClick} className={className} data-testid="typography">
      {children}
    </div>
  ),
}));

describe("Switch", () => {
  const options = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];

  it("renders all options", () => {
    const onChange = jest.fn();
    render(<Switch options={options} value="option1" onChange={onChange} />);

    options.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it("calls onChange when an option is clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Switch options={options} value="option1" onChange={onChange} />);

    const option2 = screen.getByText("Option 2");
    await user.click(option2);

    expect(onChange).toHaveBeenCalledWith("option2");
  });

  it("highlights the selected option", () => {
    const onChange = jest.fn();
    render(<Switch options={options} value="option2" onChange={onChange} />);

    const typographyElements = screen.getAllByTestId("typography");
    const selectedOption = typographyElements.find((el) =>
      el.textContent?.includes("Option 2")
    );

    expect(selectedOption).toHaveClass("bg-white");
  });

  it("does not highlight non-selected options", () => {
    const onChange = jest.fn();
    render(<Switch options={options} value="option1" onChange={onChange} />);

    const typographyElements = screen.getAllByTestId("typography");
    const nonSelectedOption = typographyElements.find((el) =>
      el.textContent?.includes("Option 2")
    );

    expect(nonSelectedOption).not.toHaveClass("bg-white");
  });

  it("works with different value types", () => {
    const onChange = jest.fn();
    const customOptions = [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ];

    render(<Switch options={customOptions} value="yes" onChange={onChange} />);

    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("handles multiple clicks correctly", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Switch options={options} value="option1" onChange={onChange} />);

    await user.click(screen.getByText("Option 2"));
    expect(onChange).toHaveBeenCalledWith("option2");

    await user.click(screen.getByText("Option 3"));
    expect(onChange).toHaveBeenCalledWith("option3");

    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
