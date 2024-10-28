import { Opacity, Typography } from "@gardenfi/garden-book";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";
import { useGarden } from "@gardenfi/react-hooks";
import Spinner from "./../../constants/spinner.json";
import Lottie from "react-lottie-player";
import { useEffect } from "react";
import axios from "axios";
import { API } from "../../constants/api";
import { Chain } from "@gardenfi/orderbook";
import { OrderActions, parseAction } from "@gardenfi/core";

export const Address = () => {
  const { address } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const { pendingOrders, isExecuting } = useGarden();
  const handleAddressClick = () => setOpenModal(modalNames.transactionsSideBar);

  useEffect(() => {
    if (!pendingOrders || !pendingOrders.length || isExecuting) return;

    const fetchBlockNumbers = async () => {
      try {
        const blockNumber = await axios.get<{
          [key in Chain]: number;
        }>(API().data.data + "/blocknumber/testnet");

        return blockNumber.data;
      } catch (error) {
        console.error("Error fetching block numbers", error);
      }
    };

    fetchBlockNumbers().then((blockNumbers) => {
      if (!blockNumbers) return;

      const executableOrders = pendingOrders.filter((order) => {
        const sourceBlockNumber = blockNumbers[order.source_swap.chain];
        const destinationBlockNumber =
          blockNumbers[order.destination_swap.chain];

        if (!sourceBlockNumber || !destinationBlockNumber) return;

        const action = parseAction(
          order,
          sourceBlockNumber,
          destinationBlockNumber,
        );
        return action === OrderActions.Redeem || action === OrderActions.Refund;
      });

      if (executableOrders && executableOrders.length > 0)
        setOpenModal(modalNames.initializeSM);
    });
  }, [pendingOrders]);

  return (
    <Opacity
      level="medium"
      className="flex items-center gap-2 ml-auto py-3 px-4 rounded-full cursor-pointer"
      onClick={handleAddressClick}
    >
      <Typography size="h3" weight="bold">
        {getTrimmedAddress(address ?? "")}
      </Typography>
      {pendingOrders?.length ? (
        <div className="relative">
          <Lottie
            loop
            animationData={Spinner}
            play
            speed={2}
            style={{ width: 26, height: 26 }}
          />
          <div className="absolute text-rose text-sm font-bold top-[12%] left-[33%]">
            {pendingOrders.length}
          </div>
        </div>
      ) : (
        <></>
      )}
    </Opacity>
  );
};