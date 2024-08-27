import { useAccount, useConnect } from "wagmi";
import { modalNames, modalStore } from "../../store/modalStore";
import { ReferralModal, WalletModal } from "./Modal";

export const Swap = () => {
  const { connectors, connect } = useConnect();
  const { address } = useAccount();
  console.log("account :", address);
  const setOpenModal = modalStore((state) => state.setOpenModal);

  // const handleOpenWalletModal = () => {
  //   setOpenModal(modalNames.connectWallet);
  // };

  // const handleOpenReferralModal = () => {
  //   setOpenModal(modalNames.referralModal);
  // }

  return (
    <div className="flex flex-col">
      {connectors.map((connector) => (
        <button key={connector.uid} onClick={() => connect({ connector })}>
          {connector.name}
        </button>
      ))}

      <button onClick={() => setOpenModal(modalNames.connectWallet)}>Open wallet modal</button>
      <button onClick={() => setOpenModal(modalNames.referralModal)}>Open referral modal</button>

      <WalletModal />
      <ReferralModal />
    </div>
  );
};
