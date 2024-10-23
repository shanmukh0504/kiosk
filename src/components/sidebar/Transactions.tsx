import { Typography } from "@gardenfi/garden-book";
import { Transaction } from "./Transaction";
import { PaginatedData, CreateOrder } from "@gardenfi/orderbook";

export const Transactions = () => {
    const mockOrders: PaginatedData<CreateOrder> = {
        data: [
            {
                source_chain: "Ethereum",
                destination_chain: "Bitcoin",
                source_asset: "ETH",
                destination_asset: "BTC",
                initiator_source_address: "0x123...",
                initiator_destination_address: "1BitcoinAddress...",
                source_amount: "1.5",
                destination_amount: "0.06212967",
                fee: "0.01",
                nonce: "123456",
                min_destination_confirmations: 3,
                timelock: 600,
                secret_hash: "abcd1234",
                created_at: "2023-10-01T12:34:56Z",
                updated_at: "2023-10-01T12:40:00Z",
                deleted_at: null,
                create_id: "order1",
                block_number: "1234567",
                additional_data: {
                    strategy_id: "strategy1",
                    sig: "signature1",
                    input_token_price: 2000,
                    output_token_price: 60000,
                    deadline: "2023-10-02T12:00:00Z",
                },
            },
            {
                source_chain: "Ethereum",
                destination_chain: "Bitcoin",
                source_asset: "ETH",
                destination_asset: "BTC",
                initiator_source_address: "0x456...",
                initiator_destination_address: "1BitcoinAddress...",
                source_amount: "2",
                destination_amount: "0.08417290",
                fee: "0.02",
                nonce: "654321",
                min_destination_confirmations: 6,
                timelock: 1200,
                secret_hash: "efgh5678",
                created_at: "2023-10-02T13:00:00Z",
                updated_at: "2023-10-02T13:05:00Z",
                deleted_at: null,
                create_id: "order2",
                block_number: "1234578",
                additional_data: {
                    strategy_id: "strategy2",
                    sig: "signature2",
                    input_token_price: 1900,
                    output_token_price: 61000,
                    deadline: "2023-10-03T13:00:00Z",
                },
            },
        ],
        page: 1,
        total_pages: 1,
        total_items: 2,
        per_page: 10,
    };

    return (
        <div className="flex flex-col gap-4 bg-white/50 rounded-2xl w-full px-4 pt-4 pb-6">
            <Typography size="h5" weight="bold">
                Transactions
            </Typography>
            {mockOrders.data.map((order) => (
                <>
                <div key={order.create_id}>
                    <Transaction order={order} />
                </div>
                <div className="bg-white/50 w-full h-[1px]"></div>
                </>
            ))}
        </div>
    );
};
