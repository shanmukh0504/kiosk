import { describe, it, expect } from "vitest";
import { getBalanceMulticall } from "./getBalanceMulticall";
import { Chains } from "@gardenfi/orderbook";

describe("getBalanceMulticall", () => {
  it("should return the balance of the tokens", async () => {
    const balance = await getBalanceMulticall(
      [
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
        "0x623cD3a3EdF080057892aaF8D773Bbb7A5C9b6e9",
        "0x3992B27dA26848C2b19CeA6Fd25ad5568B68AB98",
      ],
      "0xd53D4f100AaBA314bF033f99f86a312BfbdDF113",
      Chains.base,
    );

    expect(balance).toHaveProperty(
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    );
    expect(balance).toHaveProperty(
      "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf"
    );
    expect(balance).toHaveProperty(
      "0x623cD3a3EdF080057892aaF8D773Bbb7A5C9b6e9"
    );
    expect(balance).toHaveProperty(
      "0x3992B27dA26848C2b19CeA6Fd25ad5568B68AB98"
    );
  });

  it("should return an empty object if token list is empty", async () => {
    const balance = await getBalanceMulticall(
      [],
      "0xd53D4f100AaBA314bF033f99f86a312BfbdDF113",
      Chains.base
    );

    expect(balance).toEqual({});
  });
});
