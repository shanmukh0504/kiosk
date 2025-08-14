import { describe, it } from "vitest";
import { formatAmount } from "./utils";
import logger from "./logger";

describe("utils", () => {
  it("formatNumber", () => {
    const number = formatAmount("5000", 8);
    logger.log("number :", number);
  });
});
