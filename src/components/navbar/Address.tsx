import { Opacity, Typography, WalletIcon } from "@gardenfi/garden-book";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect } from "react";
import { Loader } from "../../common/Loader";
import pendingOrdersStore from "../../store/pendingOrdersStore";
import { OrderStatus } from "@gardenfi/core";

export const Address = () => {
  const { address } = useEVMWallet();
  const { setOpenModal } = modalStore();
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

  useEffect(() => {
    if (pendingOrders) {
      setPendingOrders(pendingOrders);
    } else {
      setPendingOrders([]);
    }
  }, [pendingOrders, setPendingOrders]);

  return (
    <Opacity
      level="medium"
      className="ml-auto flex min-h-8 min-w-8 cursor-pointer items-center justify-center gap-2 rounded-full px-2 sm:px-4 sm:py-3"
      onClick={handleAddressClick}
    >
      <Typography size="h3" weight="bold" className="hidden sm:block">
        {getTrimmedAddress(address ?? "")}
      </Typography>

      <WalletIcon className="flex items-center justify-center sm:hidden" />

      {pendingOrdersCount ? (
        <div className="relative">
          <Loader />
          <div className="absolute left-[34%] top-[10%] text-sm font-bold text-rose">
            {pendingOrdersCount}
          </div>
        </div>
      ) : (
        <></>
      )}
    </Opacity>
  );
};
