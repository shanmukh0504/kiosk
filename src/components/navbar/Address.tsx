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
      className="flex items-center justify-center px-2 gap-2 ml-auto min-h-8 min-w-8 sm:py-3 sm:px-4 rounded-full cursor-pointer"
      onClick={handleAddressClick}
    >
      <Typography size="h3" weight="bold" className="hidden sm:block">
        {getTrimmedAddress(address ?? "")}
      </Typography>

      <WalletIcon className="sm:hidden justify-center flex items-center " />

      {pendingOrdersFromStore?.length ? (
        <div className="relative">
          <Loader />
          <div className="absolute text-rose text-sm font-bold top-[8%] w-full border items-center text-center">
            {pendingOrdersFromStore.length}
          </div>
        </div>
      ) : (
        <></>
      )}
    </Opacity>
  );
};
