import { FC, useMemo, useId } from "react";
import { AddIcon, LogoutIcon } from "@gardenfi/garden-book";
import {
  useBitcoinWallet,
  useLitecoinWallet,
} from "@gardenfi/wallet-connectors";
import { Tooltip } from "../../../common/Tooltip";
import { modalNames, modalStore } from "../../../store/modalStore";
import { ecosystems } from "../../navbar/connectWallet/constants";
import { Address } from "./Address";
import { swapStore } from "../../../store/swapStore";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { useStarknetWallet } from "../../../hooks/useStarknetWallet";
import { useSolanaWallet } from "../../../hooks/useSolanaWallet";
import { useSuiWallet } from "../../../hooks/useSuiWallet";
import transactionHistoryStore from "../../../store/transactionHistoryStore";
import orderInProgressStore from "../../../store/orderInProgressStore";
import { balanceStore } from "../../../store/balanceStore";
import { useTronWallet } from "../../../hooks/useTronWallet";

type AddressMenuProps = {
  onClose: () => void;
};

export const AddressMenu: FC<AddressMenuProps> = ({ onClose }) => {
  const { address, disconnect } = useEVMWallet();
  const { starknetAddress, starknetDisconnect } = useStarknetWallet();
  const { account: ltcAddress, disconnect: ltcDisconnect } =
    useLitecoinWallet();
  const { account: btcAddress, disconnect: btcDisconnect } = useBitcoinWallet();
  const { solanaAddress, solanaDisconnect } = useSolanaWallet();
  const { suiConnected, currentAccount, suiDisconnect } = useSuiWallet();
  const { tronConnected, wallet: tronWallet, tronDisconnect } = useTronWallet();
  const { setIsOpen } = orderInProgressStore();
  const { setOpenModal } = modalStore();
  const { resetTransactions } = transactionHistoryStore();
  const { clear } = swapStore();
  const { clearBalances } = balanceStore();
  const addTooltipId = useId();
  const languageTooltipId = useId();
  const referralTooltipId = useId();
  const logoutTooltipId = useId();

  const showConnectWallet = useMemo(() => {
    return !(
      (address && btcAddress && starknetAddress && ltcAddress)
      // solanaAddress &&
      // suiConnected
    );
  }, [address, btcAddress, starknetAddress, ltcAddress]);

  const handleDisconnectClick = () => {
    clear();
    disconnect();
    btcDisconnect();
    ltcDisconnect();
    starknetDisconnect();
    solanaDisconnect();
    suiDisconnect();
    tronDisconnect();
    clearBalances();
    setIsOpen(false);
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
          {ltcAddress && (
            <Address address={ltcAddress} logo={ecosystems.litecoin.icon} />
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
          {tronConnected && tronWallet?.adapter.address && (
            <Address
              address={tronWallet.adapter.address}
              logo={ecosystems.tron.icon}
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
