import { Button, InfoIcon, Typography } from "@gardenfi/garden-book";
import { FC, useEffect, useMemo } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { stakeStore } from "../../store/stakeStore";
import { useBalances } from "../../hooks/useBalances";
import { MIN_STAKE_AMOUNT } from "../../constants/stake";
import { StakeInput } from "./StakeInput";
import { StakeStats } from "./shared/StakeStats";
import { StakeOverview } from "./StakeOverview";
import { ToastContainer } from "../toast/Toast";
import { StakePositions } from "./stakePosition/StakePositions";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export const Stake: FC = () => {
  const { isConnected, address } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const {
    asset,
    inputAmount,
    fetchAndSetStakingStats,
    fetchAndSetStakeApy,
    fetchStakePosData,
    stakingStats,
    clearStakePosData,
    stakePosData,
    fetchAndSetRewards,
  } = stakeStore();
  const { tokenBalance } = useBalances(asset);

  const isStakeable = useMemo(
    () =>
      isConnected &&
      Number(inputAmount) > 0 &&
      Number(inputAmount) <= Number(tokenBalance) &&
      Number(inputAmount) % MIN_STAKE_AMOUNT === 0,
    [isConnected, inputAmount, tokenBalance]
  );

  const handleStakeClick = () => {
    if (!isStakeable) return;
    setOpenModal(modalNames.manageStake, {
      stake: {
        isStake: true,
        amount: inputAmount,
      },
    });
  };

  useEffect(() => {
    fetchAndSetStakingStats();
  }, [fetchAndSetStakingStats]);

  useEffect(() => {
    if (!address) {
      clearStakePosData();
      return;
    }

    let isFetching = false;
    const fetchData = async () => {
      if (isFetching) return;

      try {
        isFetching = true;
        await fetchAndSetStakeApy(address);
        await fetchStakePosData(address);
        await fetchAndSetRewards(address);
      } finally {
        isFetching = false;
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);

    return () => clearInterval(intervalId);
  }, [
    fetchAndSetStakeApy,
    address,
    fetchStakePosData,
    clearStakePosData,
    fetchAndSetRewards,
  ]);

  return (
    <div className="flex flex-col gap-6 mt-10 sm:mb-16 mb-8">
      <div className="flex flex-col gap-6 sm:max-w-[424px] max-w-[328px] mx-auto mt-10">
        <ToastContainer />
        <div className="flex flex-col p-4 gap-8 w-full rounded-2xl bg-opacity-50 bg-white">
          <div className="flex flex-col gap-3 ">
            <Typography size="h5" weight="bold">
              Stake to earn Bitcoin
            </Typography>
            <Typography size="h4" weight="medium">
              <Link
                to="https://docs.garden.finance/home/fundamentals/introduction/stakers"
                className="text-rose font-bold"
              >
                Stake
              </Link>{" "}
              SEED to participate in the Garden protocol and earn Bitcoin
              rewards every week. Stake in multiples of 2100 SEED and choose
              longer periods for higher APY.
            </Typography>
            <Typography size="h4" weight="medium">
              Plant your SEED, watch it grow!
            </Typography>
            <div className="flex gap-10 mt-1">
              <StakeStats
                title={
                  <div className="flex items-center gap-1">
                    APY
                    <InfoIcon />
                  </div>
                }
                value={`${stakingStats?.apy || 0} %`}
                size="sm"
              />
              <StakeStats
                title={"SEED locked"}
                value={`${stakingStats?.seedLockedPercentage || 0} %`}
                size="sm"
              />
              <StakeStats
                title={"Avg lock time"}
                value={`${stakingStats?.averageLockTime || 0} days`}
                size="sm"
              />
            </div>
          </div>
          <div className="flex gap-3 flex-col">
            <StakeInput balance={tokenBalance} />
            <Button
              size="lg"
              variant={isStakeable ? "primary" : "disabled"}
              onClick={handleStakeClick}
            >
              Stake
            </Button>
          </div>
        </div>
      </div>
      {stakePosData && stakePosData.length > 0 && (
        <AnimatePresence>
          <>
            <StakeOverview />
            <StakePositions />
          </>
        </AnimatePresence>
      )}
    </div>
  );
};
