import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { useStarknetWallet } from "../../hooks/useStarknetWallet";
import { ecosystems } from "./connectWallet/constants";
import { Opacity, Typography, WalletIcon } from "@gardenfi/garden-book";
import { modalNames, modalStore } from "../../store/modalStore";
import pendingOrdersStore from "../../store/pendingOrdersStore";
import { OrderStatus } from "@gardenfi/core";
import { useEffect } from "react";
import { useGarden } from "@gardenfi/react-hooks";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import { deletedOrdersStore } from "../../store/deletedOrdersStore";
import { isOrderExpired } from "@gardenfi/core";

const ConnectedWallets = () => {
  const { address } = useEVMWallet();
  const { starknetAddress } = useStarknetWallet();
  const { account: btcAddress } = useBitcoinWallet();
  const { solanaAddress } = useSolanaWallet();
  const { pendingOrders } = useGarden();
  const { setOpenModal } = modalStore();
  const { isOrderDeleted, cleanupDeletedOrders, deletedOrders } =
    deletedOrdersStore();
  const { pendingOrders: pendingOrdersFromStore, setPendingOrders } =
    pendingOrdersStore();
  const handleAddressClick = () => setOpenModal(modalNames.transactions);

  const pendingOrdersCount = pendingOrdersFromStore.filter(
    (order) =>
      order.status !== OrderStatus.RedeemDetected &&
      order.status !== OrderStatus.Redeemed &&
      order.status !== OrderStatus.CounterPartyRedeemDetected &&
      order.status !== OrderStatus.CounterPartyRedeemed &&
      order.status !== OrderStatus.Completed &&
      !deletedOrders.some(
        (entry) => entry.orderId === order.create_order.create_id
      )
  ).length;
  useEffect(() => {
    if (pendingOrders.length > 0) {
      cleanupDeletedOrders(pendingOrders);
      const filteredOrders = pendingOrders.filter(
        (orders) =>
          !isOrderDeleted(orders.create_order.create_id) &&
          !isOrderExpired(orders)
      );
      setPendingOrders(filteredOrders);
    } else {
      setPendingOrders([]);
    }
  }, [cleanupDeletedOrders, isOrderDeleted, pendingOrders, setPendingOrders]);

  return (
    <>
      <Opacity
        level="medium"
        className="relative z-0 ml-auto flex min-h-[32px] min-w-[32px] cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-[24px] p-2 transition-all duration-300 hover:bg-opacity-80 sm:min-h-[40px] sm:min-w-[40px] sm:gap-2 sm:p-3"
        onClick={handleAddressClick}
      >
        {!!pendingOrdersCount && (
          <div className="navbar-shine absolute left-0 top-0 -z-10 h-full w-full translate-x-[-25%] scale-150" />
        )}
        <WalletIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        {address && (
          <img
            src={ecosystems.EVM.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            alt="EVM wallet"
          />
        )}
        {btcAddress && (
          <img
            src={ecosystems.Bitcoin.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            alt="Bitcoin wallet"
          />
        )}
        {starknetAddress && (
          <img
            src={ecosystems.Starknet.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            alt="Starknet wallet"
          />
        )}
        {solanaAddress && (
          <img
            src={ecosystems.Solana.icon}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            alt="Solana wallet"
          />
        )}
        {pendingOrdersCount ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose p-2">
            <Typography size="h5" weight="medium" className="h-4 !text-white">
              {pendingOrdersCount}
            </Typography>
          </div>
        ) : (
          <></>
        )}
      </Opacity>
    </>
  );
};

export default ConnectedWallets;
