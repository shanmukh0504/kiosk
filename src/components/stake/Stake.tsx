import { Button, InfoIcon, Typography } from "@gardenfi/garden-book";
import { FC, useEffect, useId, useMemo } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { stakeStore } from "../../store/stakeStore";
import { MIN_STAKE_AMOUNT } from "../../constants/stake";
import { StakeInput } from "./StakeInput";
import { StakeStats } from "./shared/StakeStats";
import { StakeOverview } from "./StakeOverview";
import { ToastContainer } from "../toast/Toast";
import { StakePositions } from "./stakePosition/StakePositions";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Tooltip } from "../../common/Tooltip";
import { assetInfoStore } from "../../store/assetInfoStore";
import { formatAmount, getOrderPair } from "../../utils/utils";
import { rpcStore } from "../../store/rpcStore";

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
  const { balances, fetchAndSetEvmBalances } = assetInfoStore();
  const { getWorkingRPCsForChain } = rpcStore();
  const tooltipId = useId();

  const balance =
    balances &&
    asset &&
    balances[getOrderPair(asset.chain, asset.tokenAddress)];
  const tokenBalance = useMemo(() => {
    if (balance && asset) {
      return formatAmount(Number(balance), asset.decimals);
    }
    return 0;
  }, [balance, asset]);

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

  useEffect(() => {
    if (!address) return;

    const updateBalances = async () => {
      await fetchAndSetEvmBalances(address, getWorkingRPCsForChain, asset);
    };

    updateBalances();
    const interval = setInterval(updateBalances, 7000);

    return () => clearInterval(interval);
  }, [address, asset, fetchAndSetEvmBalances, getWorkingRPCsForChain]);

  return (
    <div className="mb-8 mt-10 flex flex-col gap-6 sm:mb-16">
      <div className="mx-auto mt-10 flex max-w-[328px] flex-col gap-6 sm:max-w-[424px]">
        <ToastContainer />
        <div className="flex w-full flex-col gap-8 rounded-2xl bg-white bg-opacity-50 p-3">
          <div className="flex flex-col gap-2 p-1">
            <Typography size="h5" weight="medium">
              Stake to earn Bitcoin
            </Typography>
            <Typography size="h4" weight="regular" className="!leading-5">
              <Link
                to="https://docs.garden.finance/home/fundamentals/introduction/stakers"
                className="font-medium text-rose"
              >
                Stake
              </Link>{" "}
              SEED to participate in the Garden protocol and earn Bitcoin
              rewards every week. Stake in multiples of 2100 SEED on Arbitrum
              chain and choose longer periods for higher APY.
            </Typography>
            <div className="mt-3 flex gap-10">
              <StakeStats
                title={
                  <div className="flex items-center gap-1">
                    APY
                    <div data-tooltip-id={tooltipId} className="cursor-pointer">
                      <InfoIcon />
                    </div>
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
          <div>
            <div className="flex flex-col gap-3">
              <StakeInput balance={tokenBalance} />
              <Button
                size="lg"
                variant={isStakeable ? "primary" : "disabled"}
                onClick={handleStakeClick}
              >
                Stake
              </Button>
            </div>
            <Tooltip
              id={tooltipId}
              place="top"
              content="Estimated APY you can earn on each stake. APY value is updated after every epoch based on the amount of rewards and staked positions."
              multiline={true}
            />
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
