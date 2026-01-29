import { render, screen } from "../../../__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { Quests } from "../Quests";

// Mock FeaturedQuest and Quest to control behavior
jest.mock("../FeaturedQuest", () => ({
  FeaturedQuest: ({ partner, description }: any) => (
    <div data-testid="featured-quest">
      <span data-testid="featured-partner">{partner}</span>
      <span data-testid="featured-description">{description}</span>
    </div>
  ),
}));

jest.mock("../Quest", () => ({
  Quest: ({ partner, description, showModal }: any) => (
    <div data-testid={`quest-${partner}`}>
      <div>{description}</div>
      {showModal && (
        <button data-testid={`open-modal-${partner}`} onClick={showModal}>
          Open
        </button>
      )}
    </div>
  ),
}));

// Mock QuestModal to expose its open prop
jest.mock("../QuestModal", () => ({
  QuestModal: ({ partner, description, open }: any) => (
    <div
      data-testid="quest-modal"
      data-open={open ? "true" : "false"}
      data-partner={partner}
    >
      {description}
    </div>
  ),
}));

// Mock questStore and constants
const mockFetchQuestData = jest.fn();
jest.mock("../../../store/questStore", () => ({
  questStore: () => ({ fetchQuestData: mockFetchQuestData }),
}));

jest.mock("../../../constants/quests", () => ({
  Partner: { Solv: "SOLV", Garden: "GARDEN" },
  QuestsInfo: [
    {
      partner: "GARDEN",
      name: "Garden",
      description: "Garden Desc",
      logo: <div />,
      amount: 1,
      link: "",
      logoLink: "",
    },
    {
      partner: "SOLV",
      name: "Solv",
      description: "Solv Desc",
      logo: <div />,
      amount: 2,
      link: "",
      logoLink: "",
    },
  ],
}));

describe("Quests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls fetchQuestData on mount and renders featured quest", () => {
    render(<Quests />);
    expect(mockFetchQuestData).toHaveBeenCalled();
    expect(screen.getByTestId("featured-quest")).toBeInTheDocument();
  });

  it("renders a Quest for each entry in QuestsInfo and opens modal when showModal is triggered", async () => {
    const user = userEvent.setup();
    render(<Quests />);

    // There should be quest for Garden and Solv
    expect(screen.getByTestId("quest-Garden")).toBeInTheDocument();
    expect(screen.getByTestId("quest-Solv")).toBeInTheDocument();

    // The Garden quest mock renders a button that triggers showModal -> modal open
    const openBtn = screen.getByTestId("open-modal-Garden");
    await user.click(openBtn);

    // After clicking, the QuestModal mock should reflect open=true
    const modal = screen.getByTestId("quest-modal");
    expect(modal).toHaveAttribute("data-open", "true");
  });
});
