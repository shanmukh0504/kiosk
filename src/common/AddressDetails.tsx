import { Chain, isBitcoin } from "@gardenfi/orderbook"
import { getTrimmedAddress } from "../utils/getTrimmedAddress"
import { FC, useMemo } from "react";
import { assetInfoStore } from '../store/assetInfoStore';
import { ArrowNorthEastIcon, EditIcon } from "@gardenfi/garden-book";
import { Typography } from "@gardenfi/garden-book";

type AddressDetailsProps = {
    setIsEditing?: (isEditing: boolean) => void;
    isEditing?: boolean;
    chain: Chain | undefined;
    isRefund?: boolean;
    address?: string;
};

export const AddressDetails: FC<AddressDetailsProps> = ({ setIsEditing, isEditing, chain, isRefund, address }) => {
    const { chains } = assetInfoStore();

    const redirect = useMemo(() => {
        return chains && chain ? chains[chain] : null;
    }, [chains, chain]);

    const handleAddressRedirect = (address: string, chain: Chain) => {
        if (!redirect) return;
        if (isBitcoin(chain)) window.open(redirect.explorer + 'address/' + address, '_blank');
        else window.open(redirect.explorer + '/address/' + address, '_blank');
    }
    return (
        <>
            {address && <div className={`flex justify-between items-center py-0.5 duration-300 transition-all ${!isEditing ? 'opacity-100 max-h-7 pointer-events-auto mb-0' : 'max-h-0 -mb-1 opacity-0 pointer-events-none'}`}>
                <Typography size="h5" weight="medium">
                    {isRefund ? "Refund" : "Receive"} address
                </Typography>
                <div className="flex gap-2.5 items-center">
                    <Typography size="h4" weight="medium">
                        {getTrimmedAddress(address!)}
                    </Typography>
                    {isBitcoin(chain!) && <EditIcon className="w-4 h-4 p-[2px] cursor-pointer" onClick={() => setIsEditing && setIsEditing(true)} />}
                    <ArrowNorthEastIcon className="w-4 h-4 p-[3px] cursor-pointer" onClick={() => handleAddressRedirect(address!, chain!)} />
                </div>
            </div>}
        </>
    );
}

export default AddressDetails