import { FC, useMemo, useState } from "react";
import {
  AddIcon,
  // LanguageIcon,
  // ReferralIcon,
  LogoutIcon,
  Typography,
} from "@gardenfi/garden-book";
import { useId } from "react";
import { Tooltip } from "../../common/Tooltip";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { connectWalletStore } from "../../store/connectWalletStore";
import { swapStore } from "../../store/swapStore";
import { balanceStore } from "../../store/balanceStore";

type AddressProps = {
  address: string;
};

const Address: FC<AddressProps> = ({ address }) => {
  const [addressTooltipContent, setAddressTooltipContent] = useState("Copy");
  const addressTooltipId = useId();

  const handleAddressClick = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setAddressTooltipContent("Copied");
    }
    setTimeout(() => {
      setAddressTooltipContent("Copy");
    }, 2000);
  };

  return (
    <div className="bg-white/50 rounded-full px-3 py-1">
      <Typography
        size="h3"
        weight="medium"
        className="cursor-pointer"
        onClick={handleAddressClick}
        data-tooltip-id={addressTooltipId}
      >
        {getTrimmedAddress(address)}
      </Typography>
      <Tooltip
        id={addressTooltipId}
        place="top"
        content={addressTooltipContent}
      />
    </div>
  );
};

type AddressMenuProps = {
  onClose: () => void;
};

export const AddressMenu: FC<AddressMenuProps> = ({ onClose }) => {
  const { address, disconnect } = useEVMWallet();
  const { account: btcAddress, disconnect: btcDisconnect } = useBitcoinWallet();
  const { setOpenBTCwallets } = connectWalletStore();
  const { clear } = swapStore();
  const { clearBalances } = balanceStore();
  const addTooltipId = useId();
  const languageTooltipId = useId();
  const referralTooltipId = useId();
  const logoutTooltipId = useId();

  const showConnectWallet = useMemo(() => {
    return !(address && btcAddress);
  }, [address, btcAddress]);

  const handleDisconnectClick = () => {
    clear();
    disconnect();
    onClose();
    btcDisconnect();
    clearBalances();
  };

  const handleBTCWalletClick = () => {
    onClose();
    setOpenBTCwallets();
  };

  return (
    <>
      <div className="flex justify-between">
        <div className="flex gap-3">
          {address && <Address address={address} />}
          {btcAddress && <Address address={btcAddress} />}
          {showConnectWallet && (
            <div
              data-tooltip-id={addTooltipId}
              className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer transition-colors hover:bg-white"
              onClick={handleBTCWalletClick}
            >
              <AddIcon className="w-5 h-3" />
            </div>
          )}
        </div>
        <div className="flex gap-3">
          {/* <div
            data-tooltip-id={languageTooltipId}
            className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer transition-colors hover:bg-white"
          >
            <LanguageIcon className="w-5 h-4" />
          </div>
          <div
            data-tooltip-id={referralTooltipId}
            className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer transition-colors hover:bg-white"
          >
            <ReferralIcon className="w-5 h-4" />
          </div> */}
          <div
            data-tooltip-id={logoutTooltipId}
            className="flex items-center bg-white/50 rounded-full p-1.5 cursor-pointer transition-colors hover:bg-white"
          >
            <LogoutIcon
              className="w-5 h-4 cursor-pointer"
              onClick={handleDisconnectClick}
            />

            <Tooltip id={addTooltipId} place="top" content="Wallet" />
            <Tooltip id={languageTooltipId} place="top" content="Language" />
            <Tooltip id={referralTooltipId} place="top" content="Referrals" />
            <Tooltip id={logoutTooltipId} place="top" content="Logout" />
          </div>
        </div>
      </div>
    </>
  );
};
