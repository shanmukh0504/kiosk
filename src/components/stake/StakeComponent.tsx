import { Button, InfoIcon, Typography } from "@gardenfi/garden-book";
import { Switch } from "../../common/Switch";
import { StakeStats } from "./shared/StakeStats";
import { StakeInput } from "./StakeInput";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { stakeStore, StakeType } from "../../store/stakeStore";
import { useBalances } from "../../hooks/useBalances";
import { useEffect, useId, useMemo } from "react";
import { Tooltip } from "../../common/Tooltip";
import { MIN_STAKE_AMOUNT } from "../../constants/stake";
import { GardenPassVotes, SEED_FOR_MINTING_NFT } from "./constants";
import { motion, AnimatePresence } from "framer-motion";
import { fadeAnimation } from "../../animations/animations";

export const StakeComponent = () => {
  const { isConnected, address } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const {
    asset,
    inputCustomSeed,
    inputPassSeed,
    fetchAndSetStakingStats,
    fetchAndSetStakeApy,
    fetchStakePosData,
    stakingStats,
    clearStakePosData,
    fetchAndSetRewards,
    fetchAndSetEpoch,
    stakeType,
    setStakeType,
  } = stakeStore();
  const { tokenBalance } = useBalances(asset);
  const tooltipId = useId();

  const isStakeable = useMemo(
    () =>
      isConnected && stakeType === StakeType.CUSTOM
        ? Number(inputCustomSeed) > 0 &&
          Number(inputCustomSeed) <= Number(tokenBalance) &&
          Number(inputCustomSeed) % MIN_STAKE_AMOUNT === 0
        : Number(inputPassSeed) > 0 &&
          Number(inputPassSeed) <= Number(tokenBalance) &&
          Number(inputPassSeed) % SEED_FOR_MINTING_NFT === 0,
    [isConnected, inputCustomSeed, inputPassSeed, tokenBalance, stakeType]
  );

  const handleStakeClick = () => {
    if (!isStakeable) return;
    setOpenModal(modalNames.manageStake, {
      stake: {
        isStake: true,
        amount:
          stakeType === StakeType.CUSTOM
            ? inputCustomSeed.toString()
            : inputPassSeed.toString(),
      },
    });
  };

  useEffect(() => {
    fetchAndSetStakingStats();
    fetchAndSetEpoch();
  }, [fetchAndSetStakingStats, fetchAndSetEpoch]);

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
        // TODO: remove this once we have a proper way to fetch stake apy
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
    <div className="flex w-full max-w-[328px] flex-col gap-6 rounded-2xl bg-white bg-opacity-50 p-4 pb-5 sm:max-w-[460px]">
      <div className="flex flex-col gap-6">
        <div className="flex w-full items-center justify-between">
          <Typography size="h4" weight="bold">
            Stake
          </Typography>
          <Switch<StakeType>
            options={[
              { label: "Garden pass", value: StakeType.GARDEN_PASS },
              { label: "Custom", value: StakeType.CUSTOM, default: true },
            ]}
            value={stakeType}
            onChange={setStakeType}
          />
        </div>
        <div className="flex flex-col gap-6">
          <Typography size="h4" weight="medium">
            <AnimatePresence mode="wait">
              {stakeType === StakeType.CUSTOM ? (
                <motion.span key="custom" {...fadeAnimation}>
                  Deposit SEED into Garden and unlock new opportunities like
                  discounted fees. Stake in multiples of{" "}
                  <Typography className="!text-rose" weight="bold">
                    2100 SEED
                  </Typography>{" "}
                  to participate
                </motion.span>
              ) : (
                <motion.span key="garden-pass" {...fadeAnimation}>
                  Stake 21,000 SEED to unlock a Gardener Pass. Max staking
                  yield, full voting power.
                </motion.span>
              )}
            </AnimatePresence>
          </Typography>
          <div className="flex gap-10">
            <StakeStats
              title={
                <div className="flex items-center gap-1">
                  APY
                  <div data-tooltip-id={tooltipId} className="cursor-pointer">
                    <InfoIcon className="h-4 w-4" />
                  </div>
                </div>
              }
              value={`${stakingStats?.globalApy || 0} %`}
              size="sm"
            />
            <AnimatePresence mode="wait">
              {stakeType === StakeType.GARDEN_PASS ? (
                <motion.div key="custom" {...fadeAnimation}>
                  <StakeStats
                    title={"Votes"}
                    value={`${GardenPassVotes}`}
                    size="sm"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="garden-pass"
                  {...fadeAnimation}
                  className="flex gap-10"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-col gap-4">
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
  );
};
