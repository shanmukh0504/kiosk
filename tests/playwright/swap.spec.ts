import { test } from "@playwright/test";
import { percySnapshot } from "./percy";

test.describe("Swap visual states (mocked)", () => {
  const mockAssets = {
    BTC: {
      id: "bitcoin:btc",
      name: "Bitcoin",
      symbol: "BTC",
      decimals: 8,
      icon: "https://garden.imgix.net/token-images/bitcoin.svg",
      token: null,
      htlc: null,
      chain: "bitcoin",
    },
    WBTC: {
      id: "ethereum:wbtc",
      name: "Ether",
      symbol: "WBTC",
      decimals: 8,
      icon: "https://garden.imgix.net/token-images/wbtc.svg",
      token: null,
      htlc: null,
      chain: "evm:1",
    },
  };

  const injectMocks = async (page: any) => {
    // Mock EventSource so balance subscriptions work deterministically
    await page.addInitScript(() => {
      // @ts-ignore
      class MockEventSource {
        url: string;
        onmessage: ((e: any) => void) | null = null;
        onerror: ((e: any) => void) | null = null;
        constructor(url: string) {
          this.url = url;
          // emit a mock balance update shortly after creation
          setTimeout(() => {
            if (this.onmessage) {
              const payload = {
                chain: "evm",
                balances: [
                  {
                    asset_id: "ethereum:wbtc",
                    asset_name: "WBTC",
                    chain: "evm:1",
                    balance: "100000000",
                    decimals: 8,
                  },
                ],
              };
              this.onmessage({ data: JSON.stringify(payload) });
            }
          }, 200);
        }
        close() {
          /* no-op */
        }
      }
      // @ts-ignore
      (window as any).EventSource = MockEventSource;
    });
  };

  test.beforeEach(async ({ page }) => {
    await injectMocks(page);
    // expose a small helper to ensure stores are present when app initializes
    await page.goto("/");
  });

  test("swap - default (not connected) UI", async ({ page }) => {
    // ensure stores are exposed by the app (VITE_EXPOSE_STORES_FOR_TESTS=true)
    await page.evaluate((assets) => {
      // @ts-ignore
      if ((window as any).__stores?.assetInfoStore) {
        // @ts-ignore
        window.__stores.assetInfoStore.setState({ assets });
      }
      // reset swap state (use getState() so we don't trigger React hooks)
      // @ts-ignore
      if ((window as any).__stores?.swapStore) {
        // @ts-ignore
        window.__stores.swapStore.getState().clearSwapState();
      }
    }, mockAssets);

    await page.goto("/swap");
    await page.waitForTimeout(500);
    await percySnapshot(page, "Swap - default (not connected)");
  });

  test("swap - assets selected state", async ({ page }) => {
    await page.evaluate((assets) => {
      // set assets and choose BTC -> WBTC and amount
      // @ts-ignore
      window.__stores.assetInfoStore.setState({ assets });
      // @ts-ignore
      window.__stores.swapStore.setState({
        inputAsset: assets.BTC,
        outputAsset: assets.WBTC,
        inputAmount: "0.01",
        outputAmount: "0.0005",
      });
    }, mockAssets);

    await page.goto("/swap");
    await page.waitForTimeout(300);
    await percySnapshot(page, "Swap - assets selected");
  });

  test("swap - swap in progress (submitted, processing, completed)", async ({ page }) => {
    // start with selected assets
    await page.evaluate((assets) => {
      // @ts-ignore
      window.__stores.assetInfoStore.setState({ assets });
      // set initial swap state
      // @ts-ignore
      window.__stores.swapStore.setState({
        inputAsset: assets.BTC,
        outputAsset: assets.WBTC,
        inputAmount: "0.01",
        outputAmount: "0.0005",
      });
    }, mockAssets);

    await page.goto("/swap");
    await page.waitForTimeout(300);

    // simulate submitted
    await page.evaluate(() => {
      // @ts-ignore
      window.__stores.swapStore.setState({ isSwapping: true, swapProgress: "submitted" });
    });
    await page.waitForTimeout(200);
    await percySnapshot(page, "Swap - progress submitted");

    // simulate processing
    await page.evaluate(() => {
      // @ts-ignore
      window.__stores.swapStore.setState({ swapProgress: "processing" });
    });
    await page.waitForTimeout(200);
    await percySnapshot(page, "Swap - progress processing");

    // simulate completed -> update pending orders / orderInProgress stores (call stores to get actions)
    await page.evaluate(() => {
      const fakeOrder = {
        order_id: "MOCK_ORDER_1",
        source_swap: {},
        destination_swap: {},
        status: "redeem_detected",
      };
      // @ts-ignore
      window.__stores.orderInProgressStore.getState().setOrder(fakeOrder);
      // @ts-ignore
      window.__stores.pendingOrdersStore.getState().setPendingOrders([fakeOrder]);
      // clear swapping UI
      // @ts-ignore
      window.__stores.swapStore.setState({ isSwapping: false, swapProgress: "" });
    });
    await page.waitForTimeout(200);
    await percySnapshot(page, "Swap - completed");
  });
});

