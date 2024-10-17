import { Opacity, Typography } from "@gardenfi/garden-book";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { getTrimmedAddress } from "../../utils/getTrimmedAddress";

export const Address = () => {
  const { address } = useEVMWallet();
  const { setOpenModal } = modalStore();

  const handleAddressClick = () => setOpenModal(modalNames.transactionsSideBar);

  return (
    <Opacity
      level="medium"
      className="ml-auto py-3 px-4 rounded-full cursor-pointer"
    >
      <Typography size="h3" weight="bold" onClick={handleAddressClick}>
        {getTrimmedAddress(address ?? "")}
      </Typography>
    </Opacity>
  );
};
