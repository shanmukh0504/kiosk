import { Typography } from "@gardenfi/garden-book";
import { Transaction } from "./Transaction";

export const Transactions = () => {
    return (
        <div className="flex flex-col gap-4 bg-white/50 rounded-2xl w-full p-4">
            <Typography size="h5" weight="bold">
                Transactions
            </Typography>
            <Transaction />
            <div className="bg-white/50 w-full h-[1px]"></div>
            <Transaction />
            <div className="bg-white/50 w-full h-[1px]"></div>
            <Transaction />
        </div>
    );
};
