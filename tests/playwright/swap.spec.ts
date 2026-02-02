import { test } from "@playwright/test";
import { OrderStatus } from "@gardenfi/orderbook";
import { percySnapshot } from "./percy";

const MOCK_WALLET = {
    evm: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfj5x4wlh",
};

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

function buildMockOrder(opts: {
    orderId: string;
    status: string | OrderStatus;
    sourceAsset?: string;
    destAsset?: string;
    sourceAmount?: string;
    destAmount?: string;
    depositAddress?: string;
}) {
    const {
        orderId = "22ca826d366347f01a19b17942a5135ee79b21398e3f4ba202d60ddd5f0d92ad",
        status = OrderStatus.Created,
        sourceAsset = "bitcoin:btc",
        destAsset = "ethereum:wbtc",
        sourceAmount = "2615978",
        destAmount = "1997827630",
        depositAddress = "bc1p537s2efgqq0y8gqd0q08a5j065ac3863206pqey6gpvf8dux640q7frm27",
    } = opts;

    const now = new Date().toISOString();
    const isCreated = status === OrderStatus.Created || status === "Created";
    const isInitiateDetected = status === OrderStatus.InitiateDetected || status === "InitiateDetected";
    const isInitiated =
        status === OrderStatus.Initiated ||
        status === OrderStatus.AwaitingRedeem ||
        status === "Initiated" ||
        status === "AwaitingRedeem";
    const isRedeemDetected =
        status === OrderStatus.RedeemDetected ||
        status === OrderStatus.Redeemed ||
        status === "RedeemDetected" ||
        status === "Redeemed";
    const hasInitiateTx = !isCreated;
    const hasRedeemTx = isRedeemDetected;

    return {
        order_id: orderId,
        status,
        created_at: now,
        source_swap: {
            created_at: now,
            swap_id: depositAddress,
            chain: "bitcoin",
            asset: sourceAsset,
            initiator: MOCK_WALLET.bitcoin,
            redeemer: "03c15ad9d33d21a1a7ff75276dd530717988003b977525c726f72b7ccf4dc610",
            delegate: "babd4bece34791d7126c148266e1726421660567dcca68a7097a65d7a7f86d9b",
            timelock: 144,
            filled_amount: isRedeemDetected ? sourceAmount : isInitiateDetected || isInitiated ? sourceAmount : "0",
            asset_price: 76600.0,
            amount: sourceAmount,
            secret_hash: "6c5b26f0767e74c25f0ab627f494e5296210426a46e229c172e81acb6b340a83",
            secret: isRedeemDetected ? "fa572f347615e91662ee7f6ad2b24153579b08fcec230af8345def7226793e8e" : "",
            instant_refund_tx: hasInitiateTx ? "020000000001012cbfd464eb7eb78c0c97f53a95d1f9a88ec37e2e4c5ffca77e3c9a9596864ebd0000000000ffffffff01aaea270000000000160014b73db83debee785f2f869bbc19930bd0b420c16604412854f3e4d9c905d43996314ca86b7dea8cceff0cdcdd57b5606123517f378bc06227a4168fe60613fe0d9b3e1387ea1e68be1c17a2f6416273765912f6d2130583412854f3e4d9c905d43996314ca86b7dea8cceff0cdcdd57b5606123517f378bc06227a4168fe60613fe0d9b3e1387ea1e68be1c17a2f6416273765912f6d21305834620babd4bece34791d7126c148266e1726421660567dcca68a7097a65d7a7f86d9bac2003c15ad9d33d21a1a7ff75276dd530717988003b977525c726f72b7ccf4dc610ba529c61c02160e11a135f94e536a5b222e5d09fd9db1be5f5f5e753920290c0410cf388f0e439a922488f0650969c5026bf37c6fac8a330741e89fdf0ed95c56268e6bf2296c0bf91f39f0c28f918dbda2d0120531396f626a587e8035fffc3900f7f3a9700000000" : "",
            initiate_tx_hash: hasInitiateTx ? "bd4e8696959a3c7ea7fc5f4c2e7ec38ea8f9d1953af5970c8cb77eeb64d4bf2c:934704" : "",
            redeem_tx_hash: hasRedeemTx ? "4f19f4df6b8f26847f4597842c02f055e68f757d9a5b27187d46c12a8315e044" : "",
            refund_tx_hash: "",
            initiate_block_number: hasInitiateTx ? "934704" : "0",
            redeem_block_number: hasRedeemTx ? "934705" : "0",
            refund_block_number: "0",
            required_confirmations: 1,
            current_confirmations: isInitiateDetected ? 0 : isInitiated || isRedeemDetected ? 1 : 0,
            initiate_timestamp: hasInitiateTx ? new Date(Date.now() - 5 * 60 * 1000).toISOString() : null,
            redeem_timestamp: hasRedeemTx ? new Date(Date.now() - 2 * 60 * 1000).toISOString() : null,
            refund_timestamp: null,
        },
        destination_swap: {
            created_at: now,
            swap_id: "89d5446a26a5fd76f19a3d12c8a715ea28a220d2f8e2cd9bc2a4e33cc0866cb9",
            chain: "ethereum",
            asset: destAsset,
            initiator: "0x18e489f22461281879e1D161C55668b7a521a3A9",
            redeemer: MOCK_WALLET.evm,
            timelock: 600,
            filled_amount: isRedeemDetected ? destAmount : isInitiated ? destAmount : "0",
            asset_price: 1.0,
            amount: destAmount,
            secret_hash: "6c5b26f0767e74c25f0ab627f494e5296210426a46e229c172e81acb6b340a83",
            secret: isRedeemDetected ? "fa572f347615e91662ee7f6ad2b24153579b08fcec230af8345def7226793e8e" : "",
            initiate_tx_hash: hasInitiateTx ? "0xb7a45f5748ab517bbadadac8fceb94b364efbaff35434681ef8afb397de899ac" : "",
            redeem_tx_hash: hasRedeemTx ? "0xfbb64adc4732ba2c27614094a8c2e910d4d77bc01285ec54c76a10bb641920c5" : "",
            refund_tx_hash: "",
            initiate_block_number: hasInitiateTx ? "24367856" : "0",
            redeem_block_number: hasRedeemTx ? "24367858" : "0",
            refund_block_number: "0",
            required_confirmations: 0,
            current_confirmations: 0,
            initiate_timestamp: hasInitiateTx ? new Date(Date.now() - 4 * 60 * 1000).toISOString() : null,
            redeem_timestamp: hasRedeemTx ? new Date(Date.now() - 1 * 60 * 1000).toISOString() : null,
            refund_timestamp: null,
        },
        nonce: "1770019195280",
        affiliate_fees: [],
        version: "v3",
        solver_id: "0x18e489f22461281879e1d161c55668b7a521a3a9",
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
                                            balance: "2500000",
                                        },
                                    ],
                                }),
                            });
                        }
                    }, 100);
                }
                close() {}
            }
            // @ts-ignore
            window.EventSource = MockEventSource;
        });
    };

    test.beforeEach(async ({ page }) => {
        await injectMocks(page);
        await page.goto("/");
    });

    test("Swap - default (not connected)", async ({ page }) => {
        await page.goto("/swap");
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
            };
        });
        if (!storeState.outputAsset || storeState.outputAsset.symbol !== "WBTC") {
            throw new Error(`Output asset WBTC was not set in store. Got: ${JSON.stringify(storeState.outputAsset)}`);
        }
        const outputAssetVisible = await page
            .getByTestId("kiosk-swap-output-token-button")
            .getByText("WBTC", { exact: false })
            .isVisible({ timeout: 3000 })
            .catch(() => false);
        if (!outputAssetVisible) {
            throw new Error("Output asset WBTC was not visible in UI");
        }
        await page.waitForTimeout(2000);
        await percySnapshot(page, "Swap - assets selected");
    });

    test("Swap - progress submitted", async ({ page }) => {
        const orderSubmitted = buildMockOrder({ orderId: "MOCK_ORDER_1", status: OrderStatus.Created });
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
        const orderProcessing = buildMockOrder({ orderId: "MOCK_ORDER_1", status: OrderStatus.InitiateDetected });
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
        await page.waitForTimeout(1500);
        await page.waitForSelector('[data-testid="order-status-card"]', { timeout: 5000 });
        await page.evaluate(
            ({ assets, chains }) => {
                const w = (window as any).__stores;
                if (w?.assetInfoStore) w.assetInfoStore.setState({ assets, chains });
            },
            { assets: mockAssets, chains: mockChains }
        );
        await page.waitForTimeout(500);
        const orderStatusToggle = page.getByTestId("order-status-toggle");
        await orderStatusToggle.waitFor({ state: "visible", timeout: 5000 });
        await orderStatusToggle.click();
        await page.waitForTimeout(800);
        await page.waitForSelector('[data-testid="order-status-steps"]', { timeout: 2000 });
        await percySnapshot(page, "Swap - progress processing");
    });

    test("Swap - completed", async ({ page }) => {
        const orderCompleted = buildMockOrder({ orderId: "MOCK_ORDER_1", status: OrderStatus.RedeemDetected });
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
        await page.waitForTimeout(1500);
        await page.waitForSelector('[data-testid="order-status-card"]', { timeout: 5000 });
        await page.evaluate(
            ({ assets, chains }) => {
                const w = (window as any).__stores;
                if (w?.assetInfoStore) w.assetInfoStore.setState({ assets, chains });
            },
            { assets: mockAssets, chains: mockChains }
        );
        await page.waitForTimeout(500);
        const orderStatusToggle = page.getByTestId("order-status-toggle");
        await orderStatusToggle.waitFor({ state: "visible", timeout: 5000 });
        await orderStatusToggle.click();
        await page.waitForTimeout(800);
        await page.waitForSelector('[data-testid="order-status-steps"]', { timeout: 2000 });
        await percySnapshot(page, "Swap - completed");
    });

    test("Swap - sidebar (transactions modal, connected, mock orders)", async ({ page }) => {
        const pendingOrder1 = buildMockOrder({ orderId: "MOCK_ORDER_1", status: OrderStatus.Created });
        const pendingOrder2 = buildMockOrder({ orderId: "MOCK_ORDER_2", status: OrderStatus.InitiateDetected });
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
