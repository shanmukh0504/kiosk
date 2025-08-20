import {
  ArrowNorthEastIcon,
  Button,
  InfoIcon,
  Typography,
} from "@gardenfi/garden-book";
import { Switch } from "../../common/Switch";
import { StakeStats } from "./shared/StakeStats";
import { StakeInput } from "./StakeInput";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { stakeStore, StakeType } from "../../store/stakeStore";
import { useEffect, useId, useMemo } from "react";
import { Tooltip } from "../../common/Tooltip";
import { MIN_STAKE_AMOUNT } from "../../constants/stake";
import { GardenPassVotes, SEED_FOR_MINTING_NFT } from "./constants";
import { motion, AnimatePresence } from "framer-motion";
import { fadeAnimation, springTransition } from "../../animations/animations";
import { useStake } from "../../hooks/useStake";
import { assetInfoStore } from "../../store/assetInfoStore";
import { formatAmount, getOrderPair } from "../../utils/utils";
import { rpcStore } from "../../store/rpcStore";
import { viewPortStore } from "../../store/viewPortStore";

export const StakeComponent = () => {
  const { isConnected, address } = useEVMWallet();
  const { setOpenModal } = modalStore();
  const {
    asset,
    amount,
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
  const { handleStake, loading } = useStake();
  const { workingRPCs } = rpcStore();
  const { balances, fetchAndSetEvmBalances } = assetInfoStore();
  const tooltipId = useId();
  const { isMobile, isSmallTab } = viewPortStore();

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
      isConnected && stakeType === StakeType.CUSTOM
        ? Number(amount) > 0 &&
          Number(amount) <= Number(tokenBalance) &&
          Number(amount) % MIN_STAKE_AMOUNT === 0
        : Number(SEED_FOR_MINTING_NFT) > 0 &&
          Number(SEED_FOR_MINTING_NFT) <= Number(tokenBalance) &&
          Number(SEED_FOR_MINTING_NFT) % SEED_FOR_MINTING_NFT === 0,
    [isConnected, amount, tokenBalance, stakeType]
  );

  const shouldBuySeed = useMemo(() => {
    if (!balance) return true;
    return balance && Number(balance) < MIN_STAKE_AMOUNT;
  }, [balance]);

  const handleStakeClick = () => {
    if (!isStakeable || loading) return;
    if (stakeType === StakeType.CUSTOM) {
      setOpenModal(modalNames.manageStake, {
        stake: {
          isStake: true,
          amount:
            stakeType === StakeType.CUSTOM
              ? amount.toString()
              : SEED_FOR_MINTING_NFT.toString(),
        },
      });
    } else {
      handleStake(Number(SEED_FOR_MINTING_NFT), true, "INFINITE");
    }
  };

  const handleBuySeedClick = () => {
    window.open(
      "https://app.garden.finance/?output-chain=arbitrum&output-asset=SEED",
      "_blank"
    );
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

  useEffect(() => {
    if (address && asset) {
      fetchAndSetEvmBalances(address, workingRPCs, asset);

      const interval = setInterval(() => {
        fetchAndSetEvmBalances(address, workingRPCs, asset);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [address, fetchAndSetEvmBalances, workingRPCs, asset]);

  return (
    <div className="z-10 flex w-full max-w-[328px] flex-col gap-6 rounded-2xl bg-white bg-opacity-50 p-4 pb-5 sm:max-w-[460px]">
      <div className="flex flex-col gap-6">
        <div className="flex w-full items-center justify-between">
          <Typography size="h4" weight="medium">
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
        <div className="flex flex-col">
          <Typography size="h4" weight="regular" className="mb-6">
            <AnimatePresence mode="wait">
              {stakeType === StakeType.CUSTOM ? (
                <motion.span key="custom" {...fadeAnimation}>
                  Deposit SEED into Garden and unlock new opportunities like
                  discounted fees. Stake in multiples of{" "}
                  <Typography className="!text-rose" weight="medium">
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
          <AnimatePresence mode="wait">
            {stakeType === StakeType.GARDEN_PASS &&
              (isMobile || isSmallTab) && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  transition={springTransition}
                >
                  <Typography
                    size="h4"
                    weight="regular"
                    className="flex items-center gap-1"
                  >
                    check out the NFT at{" "}
                    <span
                      onClick={() => window.open("", "_blank")}
                      className="flex cursor-pointer items-center gap-1 text-rose"
                    >
                      <span>OpenSea</span>
                      <ArrowNorthEastIcon className="h-3 w-3 p-0.5" />
                    </span>
                  </Typography>
                </motion.div>
              )}
          </AnimatePresence>
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
            <StakeStats
              title={"SEED locked"}
              value={`${stakingStats?.seedLockedPercentage || 0} %`}
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
            variant={
              (isStakeable && !loading) || shouldBuySeed
                ? "primary"
                : "disabled"
            }
            onClick={shouldBuySeed ? handleBuySeedClick : handleStakeClick}
            loading={loading}
          >
            {shouldBuySeed
              ? "Buy SEED"
              : stakeType === StakeType.GARDEN_PASS
                ? "Buy Garden Pass"
                : "Stake"}
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
