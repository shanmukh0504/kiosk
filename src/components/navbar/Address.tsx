import { Opacity, Typography, WalletIcon } from "@gardenfi/garden-book";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { useGarden } from "@gardenfi/react-hooks";
import { OrderStatus } from "@gardenfi/core";
import { useMemo } from "react";
import { Loader } from "../../common/Loader";

export const Address = () => {
  const { address } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const { pendingOrders } = useGarden();
  const handleAddressClick = () => setOpenModal(modalNames.transactions);

  const actualPendingOrders = useMemo(
    () =>
      pendingOrders?.filter(
        (order) =>
          order.status !== OrderStatus.RedeemDetected &&
          order.status !== OrderStatus.Matched
      ),
    [pendingOrders]
  );

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

      {actualPendingOrders?.length ? (
        <div className="relative">
          <Loader />
          <div className="absolute text-rose text-sm font-bold top-[6%] left-[35%]">
            {actualPendingOrders.length}
          </div>
        </div>
      ) : (
        <></>
      )}
    </Opacity>
  );
};
