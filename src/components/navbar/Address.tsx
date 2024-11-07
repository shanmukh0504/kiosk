import { Opacity, Typography } from "@gardenfi/garden-book";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { useGarden } from "@gardenfi/react-hooks";
import Spinner from "./../../constants/spinner.json";
import Lottie from "react-lottie-player";
import { OrderStatus } from "@gardenfi/core";
import { useMemo } from "react";

export const Address = () => {
  const { address } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const { pendingOrders } = useGarden();
  const handleAddressClick = () => setOpenModal(modalNames.transactionsSideBar);

  const actualPendingOrders = useMemo(
    () =>
      pendingOrders?.filter(
        (order) => order.status !== OrderStatus.RedeemDetected
      ),
    [pendingOrders]
  );

  return (
    <Opacity
      level="medium"
      className="flex items-center gap-2 ml-auto py-3 px-4 rounded-full cursor-pointer"
      onClick={handleAddressClick}
    >
      <Typography size="h3" weight="bold">
        {getTrimmedAddress(address ?? "")}
      </Typography>
      {actualPendingOrders?.length ? (
        <div className="relative">
          <Lottie
            loop
            animationData={Spinner}
            play
            speed={2}
            style={{ width: 26, height: 26 }}
          />
          <div className="absolute text-rose text-sm font-bold top-[12%] left-[33%]">
            {actualPendingOrders.length}
          </div>
        </div>
      ) : (
        <></>
      )}
    </Opacity>
  );
};
