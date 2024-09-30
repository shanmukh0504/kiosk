import { FC, useState } from "react";
import { SwapDetailsComparison } from "./SwapDetailsComparison";
import { Typography } from "@gardenfi/garden-book";

type SwapDetailsProps = {
  setIsPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SwapDetails: FC<SwapDetailsProps> = ({ setIsPopupOpen }) => {
  const [showComparison, setShowComparison] = useState(false);

  const handleShowComparison = (visible: boolean) => {
    setShowComparison(visible);
    setIsPopupOpen(visible);
  };

  return (
    <>
      <SwapDetailsComparison
        visible={showComparison}
        hide={() => handleShowComparison(false)}
      />
      <div
        className="flex flex-col gap-1
        bg-white/50 rounded-2xl
        pt-4 pb-3 px-4
        cursor-pointer transition-[background-color] hover:bg-white"
        onClick={() => handleShowComparison(true)}
      >
        <Typography size="h5" weight="bold">
          Details
        </Typography>
        <div className="flex justify-between">
          <Typography size="h5" weight="medium">
            Fees
          </Typography>
          <div className="flex gap-5 py-1">
            <Typography size="h4" weight="medium">
              0.00101204 BTC
            </Typography>
            <Typography size="h4" weight="medium">
              $56.56
            </Typography>
          </div>
        </div>
        <div className="flex justify-between">
          <Typography size="h5" weight="medium">
            Saved
          </Typography>
          <div className="flex gap-5 py-1">
            <Typography size="h4" weight="medium">
              14m 30s
            </Typography>
            <Typography size="h4" weight="medium">
              $96.56
            </Typography>
          </div>
        </div>
      </div>
    </>
  );
};
