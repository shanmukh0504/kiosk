import { Chain, isBitcoin } from "@gardenfi/orderbook"
import { getTrimmedAddress } from "../utils/getTrimmedAddress"
import { FC } from "react";
import { assetInfoStore } from '../store/assetInfoStore';
import { ArrowNorthEastIcon, EditIcon } from "@gardenfi/garden-book";
import { Typography } from "@gardenfi/garden-book";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../hooks/useEVMWallet";

type AddressDetailsProps = {
    setIsEditing: (isEditing: boolean) => void;
    isEditing: boolean;
    chain: Chain | undefined;
    isRefund?: boolean
};

export const AddressDetails: FC<AddressDetailsProps> = ({ setIsEditing, isEditing, chain, isRefund }) => {
    const { account: btcAddress } = useBitcoinWallet();
    const { address } = useEVMWallet();
    const { chains } = assetInfoStore();

    const redirect = chains && chain ? chains[chain] : null;

    const handleAddressRedirect = (address: string) => {
        if (!redirect) return;
        window.open(redirect.explorer + '/address/' + address, '_blank');
    }
    return (
        <>
            {isBitcoin(chain!) ?
                (btcAddress && !isEditing) && <div className="flex justify-between items-center py-1">
                    <Typography size="h5" weight="medium">
                        {isRefund ? "Refund" : "Receive"} address
                    </Typography>
                    <div className="flex gap-2.5 items-center">
                        <Typography size="h4" weight="medium">
                            {getTrimmedAddress(btcAddress)}
                        </Typography>
                        <EditIcon className="w-4 h-4 p-[2px] cursor-pointer pointer-events-auto" onClick={() => setIsEditing(true)} />
                        <ArrowNorthEastIcon className="w-4 h-4 p-[3px] cursor-pointer pointer-events-auto" onClick={() => handleAddressRedirect(btcAddress)} />
                    </div>
                </div>
                :
                (address && <div className="flex justify-between items-center py-1">
                    <Typography size="h5" weight="medium">
                        {isRefund ? "Refund" : "Receive"} address
                    </Typography>
                    <div className="flex gap-2.5 items-center">
                        <Typography size="h4" weight="medium">
                            {getTrimmedAddress(address)}
                        </Typography>
                        <ArrowNorthEastIcon className="w-4 h-4 p-[3px] cursor-pointer pointer-events-auto" onClick={() => handleAddressRedirect(address)} />
                    </div>
                </div>)
            }
        </>
    );
}

export default AddressDetails