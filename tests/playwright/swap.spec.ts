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

const mockChains = {
    "evm:1": {
        chain: "ethereum",
        name: "Ethereum",
        id: "evm:1",
        native_asset_id: "ethereum:eth",
        icon: "https://garden.imgix.net/chain_images/ethereum.svg",
        explorer_url: "https://etherscan.io",
        confirmation_target: 1,
        source_timelock: "7200",
        destination_timelock: "600",
        supported_htlc_schemas: ["evm:htlc_erc20"],
        supported_token_schemas: ["evm:erc20"],
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
        sourceAmount = "100000",
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
                close() { }
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
            ({ assets, chains }) => {
                const w = (window as any).__stores;
                if (!w) return;
                if (w.assetInfoStore) w.assetInfoStore.setState({ assets, chains });
                if (w.swapStore) w.swapStore.getState().clearSwapState();
                if (w.balanceStore) w.balanceStore.getState().clearBalances?.() ?? w.balanceStore.setState({ balances: {}, balanceFetched: false });
                if (w.mockWalletStore) w.mockWalletStore.getState().clear();
                if (w.orderInProgressStore) {
                    w.orderInProgressStore.getState().setOrder(null as any);
                    w.orderInProgressStore.getState().setIsOpen(false);
                }
                if (w.pendingOrdersStore) w.pendingOrdersStore.getState().setPendingOrders([]);
            },
            { assets: mockAssets, chains: mockChains }
        );
        await page.waitForTimeout(400);
        await percySnapshot(page, "Swap - default (not connected)");
    });

    test("Swap - assets selected (connected, mock balance)", async ({ page }) => {
        await page.goto("/");
        await page.waitForTimeout(200);
        await page.evaluate(
            ({ assets, chains }) => {
                const w = (window as any).__stores;
                if (!w) return;
                if (w.assetInfoStore) w.assetInfoStore.setState({ assets, chains });
            },
            { assets: mockAssets, chains: mockChains }
        );
        await page.waitForTimeout(200);
        await page.goto("/swap?input-chain=bitcoin&input-asset=BTC&output-chain=evm:1&output-asset=WBTC&value=0.01");
        await page.waitForTimeout(1000);
        await page.evaluate(
            ({ assets, chains, wallet, balances }) => {
                const w = (window as any).__stores;
                if (!w) return;
                if (w.assetInfoStore) w.assetInfoStore.setState({ assets, chains });
                if (w.swapStore) {
                    w.swapStore.setState({
                        inputAsset: assets.BTC,
                        outputAsset: assets.WBTC,
                        inputAmount: "0.01",
                        outputAmount: "0.00997",
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
                chains: mockChains,
                wallet: MOCK_WALLET,
                balances: { "bitcoin:btc": "15000000", "ethereum:wbtc": "2500000" },
            }
        );
        await page.waitForTimeout(600);
        const storeState = await page.evaluate(() => {
            const w = (window as any).__stores;
            return {
                outputAsset: w?.swapStore?.getState?.()?.outputAsset,
                inputAsset: w?.swapStore?.getState?.()?.inputAsset,
                assets: w?.assetInfoStore?.getState?.()?.assets,
                chains: w?.assetInfoStore?.getState?.()?.chains,
            };
        });
        if (!storeState.outputAsset || storeState.outputAsset.symbol !== "WBTC") {
            console.error("Output asset not set in store. Debug info:", storeState);
            throw new Error(`Output asset WBTC was not set in store. Got: ${JSON.stringify(storeState.outputAsset)}`);
        }
        const outputAssetVisible = await page
            .getByTestId("kiosk-swap-output-token-button")
            .getByText("WBTC", { exact: false })
            .isVisible({ timeout: 3000 })
            .catch(() => false);
        if (!outputAssetVisible) {
            console.error("Output asset not visible in UI. Store state:", storeState);
            throw new Error("Output asset WBTC was not visible in UI");
        }
        await percySnapshot(page, "Swap - assets selected");
    });

    test("Swap - progress submitted", async ({ page }) => {
        const orderSubmitted = buildMockOrder({ orderId: "MOCK_ORDER_1", status: "Created" });
        await page.goto("/swap");
        await page.waitForTimeout(400);
        await page.evaluate(
            ({ assets, chains, order }) => {
                const w = (window as any).__stores;
                if (!w) return;
                if (w.assetInfoStore) w.assetInfoStore.setState({ assets, chains });
                if (w.orderInProgressStore) {
                    w.orderInProgressStore.getState().setOrder(order);
                    w.orderInProgressStore.getState().setIsOpen(true);
                }
                if (w.mockWalletStore) {
                    w.mockWalletStore.getState().setAddresses({ evm: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfj5x4wlh" });
                }
            },
            { assets: mockAssets, chains: mockChains, order: orderSubmitted }
        );
        await page.waitForTimeout(400);
        await page.waitForURL(/\/(swap)?\/?/, { timeout: 3000 }).catch(() => { });
        await page.waitForTimeout(300);
        await percySnapshot(page, "Swap - progress submitted");
    });

    test("Swap - progress processing", async ({ page }) => {
        const orderProcessing = buildMockOrder({ orderId: "MOCK_ORDER_1", status: "InitiateDetected" });
        await page.goto("/swap");
        await page.waitForTimeout(400);
        await page.evaluate(
            ({ assets, chains, order }) => {
                const w = (window as any).__stores;
                if (!w) return;
                if (w.assetInfoStore) w.assetInfoStore.setState({ assets, chains });
                if (w.orderInProgressStore) {
                    w.orderInProgressStore.getState().setOrder(order);
                    w.orderInProgressStore.getState().setIsOpen(true);
                }
                if (w.mockWalletStore) {
                    w.mockWalletStore.getState().setAddresses({ evm: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfj5x4wlh" });
                }
            },
            { assets: mockAssets, chains: mockChains, order: orderProcessing }
        );
        await page.waitForTimeout(400);
        await page.waitForURL(/\/(swap)?\/?/, { timeout: 3000 }).catch(() => { });
        await page.waitForTimeout(300);
        await percySnapshot(page, "Swap - progress processing");
    });

    test("Swap - completed", async ({ page }) => {
        const orderCompleted = buildMockOrder({ orderId: "MOCK_ORDER_1", status: "RedeemDetected" });
        await page.goto("/swap");
        await page.waitForTimeout(400);
        await page.evaluate(
            ({ assets, chains, order }) => {
                const w = (window as any).__stores;
                if (!w) return;
                if (w.assetInfoStore) w.assetInfoStore.setState({ assets, chains });
                if (w.orderInProgressStore) {
                    w.orderInProgressStore.getState().setOrder(order);
                    w.orderInProgressStore.getState().setIsOpen(true);
                }
                if (w.mockWalletStore) {
                    w.mockWalletStore.getState().setAddresses({ evm: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfj5x4wlh" });
                }
            },
            { assets: mockAssets, chains: mockChains, order: orderCompleted }
        );
        await page.waitForTimeout(400);
        await page.waitForURL(/\/(swap)?\/?/, { timeout: 3000 }).catch(() => { });
        await page.waitForTimeout(300);
        await percySnapshot(page, "Swap - completed");
    });

    test("Swap - sidebar (transactions modal, connected, mock orders)", async ({ page }) => {
        const pendingOrder1 = buildMockOrder({ orderId: "MOCK_ORDER_1", status: "Created" });
        const pendingOrder2 = buildMockOrder({ orderId: "MOCK_ORDER_2", status: "InitiateDetected" });
        await page.goto("/swap");
        await page.waitForTimeout(400);
        await page.evaluate(
            ({ assets, chains, orders, wallet }) => {
                const w = (window as any).__stores;
                if (!w) return;
                if (w.assetInfoStore) w.assetInfoStore.setState({ assets, chains });
                if (w.pendingOrdersStore) w.pendingOrdersStore.getState().setPendingOrders(orders);
                if (w.mockWalletStore) {
                    w.mockWalletStore.getState().setAddresses({ evm: wallet.evm, bitcoin: wallet.bitcoin });
                }
                if (w.orderInProgressStore) {
                    w.orderInProgressStore.getState().setOrder(null as any);
                    w.orderInProgressStore.getState().setIsOpen(false);
                }
            },
            { assets: mockAssets, chains: mockChains, orders: [pendingOrder1, pendingOrder2], wallet: MOCK_WALLET }
        );
        await page.waitForTimeout(500);
        const walletsButton = page.getByTestId("navbar-wallets-button");
        await walletsButton.click({ timeout: 15000 });
        await page.waitForTimeout(400);
        await percySnapshot(page, "Swap - sidebar (transactions, mock orders)");
    });
});
