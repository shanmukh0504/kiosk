import { describe, it, expect } from "vitest";
import { getStarknetTokenBalance } from "./getTokenBalance";
import { Asset } from "@gardenfi/orderbook";

const starknetAsset = {
  chain: "starknet",
  name: "Wrapped Bitcoin",
  icon: "https://garden.imgix.net/token-images/wbtc.svg",
  htlc: {
    address:
      "0x7defd8eb3b770005ab1ca5f89ad31f98fb5bc3c52deaeafd130be3b49f967b4",
    schema: "starknet:htlc_erc20",
  },
  token: {
    address:
      "0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
    schema: "starknet:erc20",
  },
  decimals: 8,
  symbol: "WBTC",
} as Asset;

describe("getStarknetTokenBalance", () => {
  it("should return the balance of WBTC tokens from Starknet mainnet", async () => {
    const balance = await getStarknetTokenBalance(
      "0x038c9d244f178c6b1b23f3083fed64c7105dd94362f269bcec75e83bda18fca2",
      starknetAsset
    );

    expect(typeof balance).toBe("number");
    expect(balance).toBeGreaterThanOrEqual(0);
  });

  it("should return 0 when address is invalid", async () => {
    const invalidAddress =
      "0x038c9d244f178c6b1b23f308367894c7105dd94362f269bcec75e83bda18fca2";

    const balance = await getStarknetTokenBalance(
      invalidAddress,
      starknetAsset
    );

    expect(typeof balance).toBe("number");
    expect(balance).toBe(0);
  });

  it("should return 0 when asset's chain is not Starknet", async () => {
    const nonStarknetAsset: Asset = {
      ...starknetAsset,
      chain: "ethereum",
    };

    const balance = await getStarknetTokenBalance(
      "0x038c9d244f178c6b1b23f3083fed64c7105dd94362f269bcec75e83bda18fca2",
      nonStarknetAsset
    );

    expect(balance).toBe(0);
  });

  it("should return 0 when token address is invalid", async () => {
    const starknetAssetWithInvalidTokenAddress: Asset = {
      ...starknetAsset,
      token: {
        address:
          "0x038c9d244f178c6b1b23f308367894c7105dd94362f269bcec75e83bda18fca2",
        schema: "starknet:erc20",
      },
    };

    const balance = await getStarknetTokenBalance(
      "0x038c9d244f178c6b1b23f3083fed64c7105dd94362f269bcec75e83bda18fca2",
      starknetAssetWithInvalidTokenAddress
    );

    expect(typeof balance).toBe("number");
    expect(balance).toBe(0);
  });

  it("should return incorrectly formatted balance when decimals are wrong", async () => {
    const starknetAssetWithWrongDecimals = {
      ...starknetAsset,
      decimals: 18,
    };

    const balance = await getStarknetTokenBalance(
      "0x038c9d244f178c6b1b23f3083fed64c7105dd94362f269bcec75e83bda18fca2",
      starknetAssetWithWrongDecimals
    );

    const correctBalance = await getStarknetTokenBalance(
      "0x038c9d244f178c6b1b23f3083fed64c7105dd94362f269bcec75e83bda18fca2",
      starknetAsset
    );

    if (correctBalance > 0) {
      expect(balance).not.toBe(correctBalance);
      expect(balance).toBeLessThan(correctBalance);
    }
  });
});
