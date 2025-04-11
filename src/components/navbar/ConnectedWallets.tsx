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
        className="ml-auto flex min-h-8 min-w-8 cursor-pointer items-center justify-center gap-2 rounded-[24px] p-3 sm:px-4 sm:py-2"
        onClick={handleAddressClick}
      >
        <WalletIcon className="h-6 w-6" />
        {address && <img src={ecosystems.evm.icon} className="my-1 h-6 w-6" />}
        {btcAddress && (
          <img src={ecosystems.bitcoin.icon} className="my-1 h-6 w-6" />
        )}
        {starknetAddress && (
          <img src={ecosystems.starknet.icon} className="my-1 h-6 w-6" />
        )}
      </Opacity>
    </>
  );
};

export default ConnectedWallets;
