import { describe, it } from "vitest";
import { formatAmount } from "./utils";

describe("utils", () => {
  it("formatNumber", () => {
    const number = formatAmount("5000", 8);
    console.log("number :", number);
  });
});
