import { ArrowLeftIcon, Button, Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { ISwapDetails } from "../../constants/constants";

type ConfirmSwapProps = {
    swap: ISwapDetails;
    goBack: () => void;
};

export const ConfirmSwap: FC<ConfirmSwapProps> = ({ goBack }) => {
    return (
        <div
            // TODO: These are common styles with the `CreateSwap` component so
            // they should be pulled out
            className={`bg-white/50 rounded-[20px]
          relative overflow-hidden
          w-full max-w-[424px] mx-auto mt-10`}
        >
            <div className="flex flex-col gap-4 p-3">
                <div className="bg-white/50 rounded-2xl p-4">
                    <Typography size="h5" weight="bold">
                        Transaction
                    </Typography>
                </div>
                <div className="flex gap-2">
                    <div className="flex-grow">
                        <Button variant="disabled" size="lg">Awaiting Deposit</Button>
                    </div>
                    <div
                        className="flex items-center bg-dark-grey rounded-2xl p-3 cursor-pointer"
                        onClick={goBack}
                    >
                        <ArrowLeftIcon className="w-6 h-[14px]" />
                    </div>
                </div>
            </div>
        </div>
    );
};
