import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { useStarknetWallet } from "../../hooks/useStarknetWallet";

import { ecosystems } from "./connectWallet/constants";
import { Opacity, WalletIcon } from "@gardenfi/garden-book";
import { modalNames, modalStore } from "../../store/modalStore";

const ConnectedWallets = () => {
  const { address } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const { starknetAddress } = useStarknetWallet();
  const { account: btcAddress } = useBitcoinWallet();
  const handleAddressClick = () => setOpenModal(modalNames.transactions);

  return (
    <>
      <Opacity
        level="medium"
        className="ml-auto flex min-h-[32px] min-w-[32px] cursor-pointer items-center justify-center gap-1.5 rounded-[24px] p-2 transition-all duration-300 hover:bg-opacity-80 sm:min-h-[40px] sm:min-w-[40px] sm:gap-2 sm:p-3"
        onClick={handleAddressClick}
      >
        <WalletIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        {address && (
          <img
            src={ecosystems.evm.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            alt="EVM wallet"
          />
        )}
        {btcAddress && (
          <img
            src={ecosystems.bitcoin.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            alt="Bitcoin wallet"
          />
        )}
        {starknetAddress && (
          <img
            src={ecosystems.starknet.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            alt="Starknet wallet"
          />
        )}
      </Opacity>
    </>
  );
};

export default ConnectedWallets;
