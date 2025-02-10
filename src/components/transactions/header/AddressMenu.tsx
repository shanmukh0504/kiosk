import { FC, useMemo } from "react";
import {
  AddIcon,
  LogoutIcon,
} from "@gardenfi/garden-book";
import { useId } from "react";
import { Tooltip } from "../../../common/Tooltip";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { connectWalletStore } from "../../../store/connectWalletStore";
import { swapStore } from "../../../store/swapStore";
import { balanceStore } from "../../../store/balanceStore";
import { ecosystems } from "../../navbar/connectWallet/constants";
import { Address } from "./Address";



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
        <div className="flex gap-3 flex-wrap">
          {address && <Address address={address} logo={ecosystems.evm.icon} />}
          {btcAddress && <Address address={btcAddress} logo={ecosystems.bitcoin.icon} />}
          {showConnectWallet && (
            <div
              data-tooltip-id={addTooltipId}
              className="flex cursor-pointer items-center rounded-full bg-white/50 p-1.5 transition-colors hover:bg-white"
              onClick={handleBTCWalletClick}
            >
              <AddIcon className="h-3 w-5" />
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
            className="flex cursor-pointer items-center rounded-full bg-white/50 p-1.5 h-8 transition-colors hover:bg-white"
            onClick={handleDisconnectClick}
          >
            <LogoutIcon className="h-4 w-5 cursor-pointer" />

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
