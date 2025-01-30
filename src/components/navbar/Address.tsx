import { Opacity, Typography, WalletIcon } from "@gardenfi/garden-book";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { useGarden } from "@gardenfi/react-hooks";
import { useEffect } from "react";
import { Loader } from "../../common/Loader";
import { ordersStore } from "../../store/ordersStore";

export const Address = () => {
  const { address } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const { pendingOrders } = useGarden();
  const { pendingOrders: pendingOrdersFromStore, setPendingOrders } =
    ordersStore();
  const handleAddressClick = () => setOpenModal(modalNames.transactions);

  useEffect(() => {
    if (pendingOrders) {
      setPendingOrders(pendingOrders);
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

      {pendingOrdersFromStore?.length ? (
        <div className="relative">
          <Loader />
          <div className="absolute text-rose text-sm font-bold top-[10%] left-[34%]">
            {pendingOrdersFromStore.length}
          </div>
        </div>
      ) : (
        <></>
      )}
    </Opacity>
  );
};
