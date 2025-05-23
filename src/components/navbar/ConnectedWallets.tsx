import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { useStarknetWallet } from "../../hooks/useStarknetWallet";
import { ecosystems } from "./connectWallet/constants";
import { Opacity, Typography, WalletIcon } from "@gardenfi/garden-book";
import { modalNames, modalStore } from "../../store/modalStore";
import pendingOrdersStore from "../../store/pendingOrdersStore";
import { OrderStatus } from "@gardenfi/core";
import { useEffect, useMemo } from "react";
import { useGarden } from "@gardenfi/react-hooks";
import {
  cleanupExpiredOrders,
  isOrderDeleted,
  restoreDeletedOrder,
} from "../../utils/deletedOrder";

const ConnectedWallets = () => {
  const { address } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const { starknetAddress } = useStarknetWallet();
  const { account: btcAddress } = useBitcoinWallet();
  const { pendingOrders } = useGarden();
  const { pendingOrders: pendingOrdersFromStore, setPendingOrders } =
    pendingOrdersStore();
  const handleAddressClick = () => setOpenModal(modalNames.transactions);

  const pendingOrdersCount = pendingOrdersFromStore.filter(
    (order) =>
      order.status !== OrderStatus.RedeemDetected &&
      order.status !== OrderStatus.Redeemed &&
      order.status !== OrderStatus.CounterPartyRedeemDetected &&
      order.status !== OrderStatus.CounterPartyRedeemed &&
      order.status !== OrderStatus.Completed
  ).length;

  const filteredOrders = useMemo(() => {
    return pendingOrders.filter(
      (order) => !isOrderDeleted(order.create_order.create_id)
    );
  }, [pendingOrders]);

  useEffect(() => {
    if (filteredOrders) {
      setPendingOrders(filteredOrders);
    } else {
      setPendingOrders([]);
    }
  }, [filteredOrders, setPendingOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      pendingOrders.forEach((order) => {
        const orderId = order.create_order.create_id;
        if (isOrderDeleted(orderId)) {
          const currentStatus = order.status;
          if (currentStatus && currentStatus !== OrderStatus.Matched) {
            restoreDeletedOrder(orderId);
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pendingOrders]);

  useEffect(() => {
    if (pendingOrders.length > 0) {
      cleanupExpiredOrders(pendingOrders);
    }

    const cleanupInterval = setInterval(
      () => {
        if (pendingOrders.length > 0) {
          cleanupExpiredOrders(pendingOrders);
        }
      },
      5 * 60 * 1000
    );

    return () => clearInterval(cleanupInterval);
  }, [pendingOrders]);

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
        {pendingOrdersCount ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-rose p-2">
            <Typography size="h5" weight="bold" className="h-4 !text-rose">
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
