import { FC, useState } from "react";
import { SwapDetailsComparison } from "./SwapDetailsComparison";
import { Typography } from "@gardenfi/garden-book";

type SwapDetailsProps = {
  sendAmount: string;
  receiveAmount: string;
  setIsPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SwapDetails: FC<SwapDetailsProps> = ({ sendAmount, receiveAmount, setIsPopupOpen }) => {
  const [showComparison, setShowComparison] = useState(false);

  const handleShowComparison = (visible: boolean) => {
    setShowComparison(visible);
    setIsPopupOpen(visible);
  };

  return (
    (sendAmount || receiveAmount) &&
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
              {/* TODO: Show fee in selected asset */}
            </Typography>
            <Typography size="h4" weight="medium">
              {/* TODO: Show fee in USD */}
              --
            </Typography>
          </div>
        </div>
        <div className="flex justify-between">
          <Typography size="h5" weight="medium">
            Saved
          </Typography>
          <div className="flex gap-5 py-1">
            <Typography size="h4" weight="medium">
              {/* TODO: Show time saved */}
            </Typography>
            <Typography size="h4" weight="medium">
              {/* TODO: Show fee saved USD */}
              --
            </Typography>
          </div>
        </div>
      </div>
    </>
  );
};
