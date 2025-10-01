import { describe, it } from "vitest";
import { formatAmountInNumber } from "./utils";
import logger from "./logger";

describe("utils", () => {
  it("formatNumber", () => {
    const number = formatAmountInNumber("5000", 8);
    logger.log("number :", number);
  });
});
