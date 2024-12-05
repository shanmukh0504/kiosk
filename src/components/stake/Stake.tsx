
import { Button, InfoIcon, Typography } from "@gardenfi/garden-book";
import { FC } from "react";
import { StakeInput } from "./StakeInput";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";

export const Stake: FC = () => {
    const { address, isConnected } = useEVMWallet();
    const { setOpenModal } = modalStore();

    const handleConnectClick = () => {
        if (!isConnected) {
            setOpenModal(modalNames.connectWallet);
        } else {
            console.log("Initiating Stake Process...");
        }
    };


    const handleOpenAssetSelector = () => {
        setOpenModal(modalNames.stakeSeed);
    };

    return (
        <div className="flex flex-col p-4 gap-8 w-full sm:max-w-[424px] max-w-[328px] mx-auto mt-10 rounded-2xl bg-opacity-50 bg-white">
            <div className="flex flex-col gap-3 ">
                <Typography size="h5" weight="bold">
                    Stake
                </Typography>
                <Typography size="h4" weight="medium">
                    Deposit SEED into Garden and unlock new opportunities like discounted fees. Stake in multiples of <span className="text-rose font-bold">2100 SEED</span> to participate in revenue sharing.
                </Typography>
                <div className="flex gap-10 mt-1">
                    <div className="flex flex-col gap-1 w-12">
                        <div className="flex items-center justify-between">
                            <Typography size="h5" weight="bold">APY</Typography>
                            <InfoIcon />
                        </div>
                        <div className="flex gap-1">
                            <Typography size="h2" weight="medium">72</Typography>
                            <Typography size="h2" weight="medium">%</Typography>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 ">
                        <Typography size="h5" weight="bold">SEED locked</Typography>
                        <div className="flex gap-1">
                            <Typography size="h2" weight="medium">42</Typography>
                            <Typography size="h2" weight="medium">%</Typography>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 ">
                        <Typography size="h5" weight="bold">Avg lock time</Typography>
                        <div className="flex gap-1">
                            <Typography size="h2" weight="medium">423</Typography>
                            <Typography size="h2" weight="medium">days</Typography>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-3 flex-col">
                <StakeInput />
                <Button
                    size="lg"
                    onClick={address ? handleOpenAssetSelector : handleConnectClick}
                >
                    {address ? "Stake" : "Connect"}
                </Button>
            </div>
        </div>
    )
}