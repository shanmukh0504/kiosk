import { test } from "@playwright/test";
import { percySnapshot } from "./percy";

/** Mock wallet addresses used across tests for consistent "connected" state */
const MOCK_WALLET = {
  evm: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfj5x4wlh",
};

/** Mock assets matching assetInfoStore keys and getAssetFromSwap(swap.asset) */
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
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    decimals: 8,
    icon: "https://garden.imgix.net/token-images/wbtc.svg",
    token: null,
    htlc: null,
    chain: "evm:1",
  },
};

/** Build a minimal OrderWithStatus for progress/completed/sidebar. Asset ids must match mockAssets. */
function buildMockOrder(opts: {
  orderId: string;
  status: string;
  sourceAsset?: string;
  destAsset?: string;
  sourceAmount?: string;
  destAmount?: string;
  depositAddress?: string;
}) {
  const {
    orderId = "MOCK_ORDER_1",
    status = "Created",
    sourceAsset = "bitcoin:btc",
    destAsset = "ethereum:wbtc",
    sourceAmount = "100000", // 0.001 BTC in satoshi-like units
    destAmount = "10000",
    depositAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfj5x4wlh",
  } = opts;
  return {
    order_id: orderId,
    status,
    source_swap: {
      chain: "bitcoin",
      asset: sourceAsset,
      amount: sourceAmount,
      swap_id: depositAddress,
      initiator: MOCK_WALLET.bitcoin,
      initiate_tx_hash: status !== "Created" ? "mock_tx_hash_1" : "",
      filled_amount: status === "RedeemDetected" || status === "Redeemed" ? sourceAmount : "0",
      asset_price: "1",
      refund_tx_hash: "",
    },
    destination_swap: {
      chain: "evm",
      asset: destAsset,
      amount: destAmount,
      redeemer: MOCK_WALLET.evm,
      redeem_tx_hash: status === "RedeemDetected" || status === "Redeemed" ? "mock_redeem_tx" : "",
      filled_amount: status === "RedeemDetected" || status === "Redeemed" ? destAmount : "0",
      asset_price: "1",
    },
  };
}

test.describe("Swap visual states (mocked)", () => {
  const injectMocks = async (page: any) => {
    await page.addInitScript(() => {
      // @ts-ignore
      class MockEventSource {
        url: string;
        onmessage: ((e: any) => void) | null = null;
        onerror: ((e: any) => void) | null = null;
        constructor(url: string) {
          this.url = url;
          setTimeout(() => {
            if (this.onmessage) {
              this.onmessage({
                data: JSON.stringify({
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
                }),
              });
            }
          }, 200);
        }
        close() {}
      }
      // @ts-ignore
      (window as any).EventSource = MockEventSource;
    });
  };

  test.beforeEach(async ({ page }) => {
    await injectMocks(page);
    await page.goto("/");
  });

  test("Swap - default (not connected)", async ({ page }) => {
    await page.goto("/swap");
    await page.waitForTimeout(400);
    await page.evaluate(
      ({ assets }) => {
        const w = (window as any).__stores;
        if (!w) return;
        if (w.assetInfoStore) w.assetInfoStore.setState({ assets });
        if (w.swapStore) w.swapStore.getState().clearSwapState();
        if (w.balanceStore) w.balanceStore.getState().clearBalances?.() ?? w.balanceStore.setState({ balances: {}, balanceFetched: false });
        if (w.mockWalletStore) w.mockWalletStore.getState().clear();
        if (w.orderInProgressStore) {
          w.orderInProgressStore.getState().setOrder(null as any);
          w.orderInProgressStore.getState().setIsOpen(false);
        }
        if (w.pendingOrdersStore) w.pendingOrdersStore.getState().setPendingOrders([]);
      },
      { assets: mockAssets }
    );
    await page.waitForTimeout(400);
    await percySnapshot(page, "Swap - default (not connected)");
  });

  test("Swap - assets selected (connected, mock balance)", async ({ page }) => {
    await page.goto("/swap");
    await page.waitForTimeout(400);
    await page.evaluate(
      ({ assets, wallet, balances }) => {
        const w = (window as any).__stores;
        if (!w) return;
        if (w.assetInfoStore) w.assetInfoStore.setState({ assets });
        if (w.swapStore) {
          w.swapStore.setState({
            inputAsset: assets.BTC,
            outputAsset: assets.WBTC,
            inputAmount: "0.01",
            outputAmount: "0.0005",
          });
        }
        if (w.balanceStore?.getState().setBalancesForTest) {
          w.balanceStore.getState().setBalancesForTest(balances);
        }
        if (w.mockWalletStore) {
          w.mockWalletStore.getState().setAddresses({ evm: wallet.evm, bitcoin: wallet.bitcoin });
        }
        if (w.orderInProgressStore) {
          w.orderInProgressStore.getState().setOrder(null as any);
          w.orderInProgressStore.getState().setIsOpen(false);
        }
      },
      {
        assets: mockAssets,
        wallet: MOCK_WALLET,
        balances: { "bitcoin:btc": "1.5", "ethereum:wbtc": "0.25" },
      }
    );
    await page.waitForTimeout(400);
    await percySnapshot(page, "Swap - assets selected");
  });

  test("Swap - progress submitted", async ({ page }) => {
    const orderSubmitted = buildMockOrder({ orderId: "MOCK_ORDER_1", status: "Created" });
    await page.goto("/swap");
    await page.waitForTimeout(400);
    await page.evaluate(
      ({ assets, order }) => {
        const w = (window as any).__stores;
        if (!w) return;
        if (w.assetInfoStore) w.assetInfoStore.setState({ assets });
        if (w.orderInProgressStore) {
          w.orderInProgressStore.getState().setOrder(order);
          w.orderInProgressStore.getState().setIsOpen(true);
        }
        if (w.mockWalletStore) {
          w.mockWalletStore.getState().setAddresses({ evm: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfj5x4wlh" });
        }
      },
      { assets: mockAssets, order: orderSubmitted }
    );
    await page.waitForTimeout(400);
    await page.waitForURL(/\/(swap)?\/?/, { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);
    await percySnapshot(page, "Swap - progress submitted");
  });

  test("Swap - progress processing", async ({ page }) => {
    const orderProcessing = buildMockOrder({ orderId: "MOCK_ORDER_1", status: "InitiateDetected" });
    await page.goto("/swap");
    await page.waitForTimeout(400);
    await page.evaluate(
      ({ assets, order }) => {
        const w = (window as any).__stores;
        if (!w) return;
        if (w.assetInfoStore) w.assetInfoStore.setState({ assets });
        if (w.orderInProgressStore) {
          w.orderInProgressStore.getState().setOrder(order);
          w.orderInProgressStore.getState().setIsOpen(true);
        }
        if (w.mockWalletStore) {
          w.mockWalletStore.getState().setAddresses({ evm: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfj5x4wlh" });
        }
      },
      { assets: mockAssets, order: orderProcessing }
    );
    await page.waitForTimeout(400);
    await page.waitForURL(/\/(swap)?\/?/, { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);
    await percySnapshot(page, "Swap - progress processing");
  });

  test("Swap - completed", async ({ page }) => {
    const orderCompleted = buildMockOrder({ orderId: "MOCK_ORDER_1", status: "RedeemDetected" });
    await page.goto("/swap");
    await page.waitForTimeout(400);
    await page.evaluate(
      ({ assets, order }) => {
        const w = (window as any).__stores;
        if (!w) return;
        if (w.assetInfoStore) w.assetInfoStore.setState({ assets });
        if (w.orderInProgressStore) {
          w.orderInProgressStore.getState().setOrder(order);
          w.orderInProgressStore.getState().setIsOpen(true);
        }
        if (w.mockWalletStore) {
          w.mockWalletStore.getState().setAddresses({ evm: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfj5x4wlh" });
        }
      },
      { assets: mockAssets, order: orderCompleted }
    );
    await page.waitForTimeout(400);
    await page.waitForURL(/\/(swap)?\/?/, { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);
    await percySnapshot(page, "Swap - completed");
  });

  test("Swap - sidebar (transactions modal, connected, mock orders)", async ({ page }) => {
    const pendingOrder1 = buildMockOrder({ orderId: "MOCK_ORDER_1", status: "Created" });
    const pendingOrder2 = buildMockOrder({ orderId: "MOCK_ORDER_2", status: "InitiateDetected" });
    await page.goto("/swap");
    await page.waitForTimeout(400);
    await page.evaluate(
      ({ assets, orders, wallet }) => {
        const w = (window as any).__stores;
        if (!w) return;
        if (w.assetInfoStore) w.assetInfoStore.setState({ assets });
        if (w.pendingOrdersStore) w.pendingOrdersStore.getState().setPendingOrders(orders);
        if (w.mockWalletStore) {
          w.mockWalletStore.getState().setAddresses({ evm: wallet.evm, bitcoin: wallet.bitcoin });
        }
        if (w.orderInProgressStore) {
          w.orderInProgressStore.getState().setOrder(null as any);
          w.orderInProgressStore.getState().setIsOpen(false);
        }
      },
      { assets: mockAssets, orders: [pendingOrder1, pendingOrder2], wallet: MOCK_WALLET }
    );
    await page.waitForTimeout(500);
    const walletsButton = page.getByTestId("navbar-wallets-button");
    await walletsButton.click({ timeout: 15000 });
    await page.waitForTimeout(400);
    await percySnapshot(page, "Swap - sidebar (transactions, mock orders)");
  });
});
