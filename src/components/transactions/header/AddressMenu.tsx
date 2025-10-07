import { FC, useMemo, useId } from "react";
import { AddIcon, LogoutIcon } from "@gardenfi/garden-book";
import { Tooltip } from "../../../common/Tooltip";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { modalNames, modalStore } from "../../../store/modalStore";
import { ecosystems } from "../../navbar/connectWallet/constants";
import { Address } from "./Address";
import { swapStore } from "../../../store/swapStore";
import { useStarknetWallet } from "../../../hooks/useStarknetWallet";
import { useSolanaWallet } from "../../../hooks/useSolanaWallet";
import { assetInfoStore } from "../../../store/assetInfoStore";
import { useSuiWallet } from "../../../hooks/useSuiWallet";
import transactionHistoryStore from "../../../store/transactionHistoryStore";

type AddressMenuProps = {
  onClose: () => void;
};

export const AddressMenu: FC<AddressMenuProps> = ({ onClose }) => {
  const { address, disconnect } = useEVMWallet();
  const { starknetAddress, starknetDisconnect } = useStarknetWallet();
  const { account: btcAddress, disconnect: btcDisconnect } = useBitcoinWallet();
  const { solanaAddress, solanaDisconnect } = useSolanaWallet();
  const { suiConnected, currentAccount, suiDisconnect } = useSuiWallet();
  const { setOpenModal } = modalStore();
  const { resetTransactions } = transactionHistoryStore();
  const { clear } = swapStore();
  const { clearBalances } = assetInfoStore();
  const addTooltipId = useId();
  const languageTooltipId = useId();
  const referralTooltipId = useId();
  const logoutTooltipId = useId();

  const showConnectWallet = useMemo(() => {
    return !(
      address &&
      btcAddress &&
      starknetAddress &&
      solanaAddress &&
      suiConnected
    );
  }, [address, btcAddress, starknetAddress, solanaAddress, suiConnected]);

  const handleDisconnectClick = () => {
    clear();
    disconnect();
    btcDisconnect();
    starknetDisconnect();
    solanaDisconnect();
    suiDisconnect();
    clearBalances();
    onClose();
    resetTransactions();
    setTimeout(() => {
      clearBalances();
    }, 2000);
  };

  const handleBTCWalletClick = () => {
    onClose();
    setOpenModal(modalNames.connectWallet);
  };

  return (
    <>
      <div className="flex justify-between">
        <div className="flex flex-wrap gap-3">
          {address && <Address address={address} logo={ecosystems.evm.icon} />}
          {btcAddress && (
            <Address address={btcAddress} logo={ecosystems.bitcoin.icon} />
          )}
          {starknetAddress && (
            <Address
              address={starknetAddress}
              logo={ecosystems.starknet.icon}
            />
          )}
          {solanaAddress && (
            <Address address={solanaAddress} logo={ecosystems.solana.icon} />
          )}
          {suiConnected && (
            <Address
              address={currentAccount?.address ?? ""}
              logo={ecosystems.sui.icon}
            />
          )}
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
            className="flex h-8 cursor-pointer items-center rounded-full bg-white/50 p-1.5 transition-colors hover:bg-white"
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
