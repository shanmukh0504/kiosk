import { useState, FC, useMemo } from "react";
// import { SwapFeesComparison } from "./SwapFeesComparison";
import { Typography } from "@gardenfi/garden-book";
import { TokenPrices } from "../../store/swapStore";

type SwapFeesProps = {
  tokenPrices: TokenPrices;
};

export const SwapFees: FC<SwapFeesProps> = ({ tokenPrices }) => {
  const [showComparison, setIsShowComparison] = useState({
    isOpen: false,
    price: 0,
  });

  const fees = useMemo(() => {
    if (tokenPrices.input === "0" || tokenPrices.output === "0") {
      return {
        isFree: false,
        fees: 0,
      };
    }
    const fees = Number(tokenPrices.input) - Number(tokenPrices.output);
    if (fees === 0) {
      return {
        isFree: true,
        fees: Number(tokenPrices.input) * 0.003,
      };
    }

    return {
      isFree: false,
      fees,
    };
  }, [tokenPrices]);

  const handleShowComparison = (isOpen: boolean) =>
    setIsShowComparison({ ...showComparison, isOpen });

  return (
    <>
      <div
        className="flex cursor-pointer flex-col gap-3 rounded-2xl bg-white/50 px-4 pb-3 pt-4 transition-[background-color]"
        onClick={() => handleShowComparison(true)}
      >
        <Typography size="h5" weight="bold">
          Details
        </Typography>
        <div>
          <div className="flex items-center justify-between gap-0">
            <Typography size="h5" weight="medium">
              Fees
            </Typography>
            <div className="flex gap-5 py-1">
              <Typography size="h4" weight="medium">
                {fees.isFree ? (
                  <div className="flex items-center gap-1">
                    <s>{"$" + Number(fees.fees.toFixed(4))}</s>
                    <Typography
                      size="h5"
                      weight="medium"
                      className="!text-[#2CC994]"
                    >
                      $0.00
                    </Typography>
                  </div>
                ) : (
                  `${fees.fees ? "$" + fees.fees.toFixed(4) : "--"}`
                )}
              </Typography>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Typography size="h5" weight="medium">
              Saved
            </Typography>
            <div className="flex gap-5 py-1">
              <Typography size="h4" weight="medium">
                {/* TODO: Show time saved */}
              </Typography>
              <Typography size="h4" weight="medium">
                --
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
