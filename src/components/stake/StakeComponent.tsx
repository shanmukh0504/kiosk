import {
  ArrowNorthEastIcon,
  Button,
  DollarChipIcon,
  GiftBoxIcon,
  HorizontalSwap,
  InfoIcon,
  RaiseHandIcon,
  Typography,
} from "@gardenfi/garden-book";
import { ChainAsset } from "@gardenfi/orderbook";
import { Switch } from "../../common/Switch";
import { StakeStats } from "./shared/StakeStats";
import { StakeInput } from "./StakeInput";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { modalNames, modalStore } from "../../store/modalStore";
import { stakeStore, StakeType } from "../../store/stakeStore";
import React, { useEffect, useId, useMemo } from "react";
import { Tooltip } from "../../common/Tooltip";
import { MIN_STAKE_AMOUNT } from "../../constants/stake";
import { GardenPassVotes, SEED_FOR_MINTING_NFT } from "./constants";
import { motion, AnimatePresence } from "framer-motion";
import { fadeAnimation } from "../../animations/animations";
import { useStake } from "../../hooks/useStake";
import { formatAmount } from "../../utils/utils";
import { balanceStore } from "../../store/balanceStore";
import { Toast } from "../toast/Toast";
import { useToastStore } from "../../store/toastStore";

type StakeComponentProps = {
  setIsNftOpen: (open: boolean) => void;
};

export const StakeComponent: React.FC<StakeComponentProps> = ({
  setIsNftOpen,
}) => {
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
  const { hideStaticToast } = useToastStore();
  const { balances, balanceFetched, fetchAndSetEvmBalances } = balanceStore();
  const tooltipId = useId();

  const balance =
    balances && asset && balances[ChainAsset.from(asset.id).toString()];

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
      fetchAndSetEvmBalances(address);

      const interval = setInterval(() => {
        fetchAndSetEvmBalances(address);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [address, fetchAndSetEvmBalances, asset]);

  useEffect(() => {
    hideStaticToast();

    if (tokenBalance) {
      const needsMoreSeed =
        stakeType === StakeType.CUSTOM
          ? Number(amount) > Number(tokenBalance)
          : stakeType === StakeType.GARDEN_PASS
            ? Number(tokenBalance) < SEED_FOR_MINTING_NFT
            : false;

      if (needsMoreSeed) {
        Toast.needSeed(
          "Don't have SEED tokens?",
          "https://app.garden.finance/?output-chain=arbitrum&output-asset=SEED"
        );
      }
    }
  }, [amount, tokenBalance, stakeType, hideStaticToast]);

  return (
    <div
      className={`z-10 flex w-full min-w-[328px] max-w-[328px] flex-col rounded-2xl bg-white bg-opacity-50 p-4 backdrop-blur-2xl sm:min-w-[460px] sm:max-w-[460px] sm:pb-5 ${stakeType === StakeType.GARDEN_PASS ? "gap-10 sm:gap-6" : "gap-12 sm:gap-10"}`}
    >
      <div className="flex flex-col gap-6">
        <div className="flex w-full items-center justify-between">
          <Typography size="h5" breakpoints={{ sm: "h4" }} weight="medium">
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
          <Typography
            size="h5"
            breakpoints={{ sm: "h4" }}
            weight="regular"
            className={`mb-5 ${stakeType === StakeType.CUSTOM ? "max-h-12 min-h-12 sm:max-h-10 sm:min-h-10" : "max-h-12 min-h-12 sm:max-h-10 sm:min-h-10"}`}
          >
            <AnimatePresence mode="wait">
              {stakeType === StakeType.CUSTOM ? (
                <motion.span key="custom" {...fadeAnimation}>
                  Deposit SEED into Garden and unlock new opportunities like
                  discounted fees. Stake in
                  <br className="sm:hidden" /> multiples of{" "}
                  <Typography className="!text-rose" weight="medium">
                    2100 SEED
                  </Typography>{" "}
                  to participate
                </motion.span>
              ) : (
                <motion.span
                  key="garden-pass"
                  {...fadeAnimation}
                  className="w-full !leading-[20px]"
                >
                  Stake{" "}
                  <span className="!font-[570] text-rose">21,000 SEED</span> to
                  unlock a{" "}
                  <span className="hidden md:visible md:inline-flex">
                    Gardener Pass.
                  </span>{" "}
                  <span
                    onClick={() => {
                      setIsNftOpen(true);
                    }}
                    className="inline-flex cursor-pointer items-center justify-start gap-1 text-rose md:hidden"
                  >
                    Gardener Pass.
                    <ArrowNorthEastIcon className="h-3 w-3 p-0.5" />
                  </span>{" "}
                  <br /> Max staking yield, full voting power.
                  <br />{" "}
                </motion.span>
              )}
            </AnimatePresence>
          </Typography>
          <div className={`flex gap-6 pl-1`}>
            <StakeStats
              title={
                <div className="flex items-center gap-1">
                  APY
                  <div data-tooltip-id={tooltipId} className="cursor-pointer">
                    <InfoIcon className="h-3 w-3 p-[0.5px]" />
                  </div>
                </div>
              }
              value={`${stakingStats?.globalApy || 0} %`}
              size="sm"
            />
            <AnimatePresence mode="wait">
              {stakeType === StakeType.GARDEN_PASS ? (
                <motion.div
                  key="custom"
                  {...fadeAnimation}
                  className="flex gap-6"
                >
                  <StakeStats
                    title={"Votes"}
                    value={`${GardenPassVotes}`}
                    size="sm"
                  />
                  <StakeStats
                    title={"Passes minted"}
                    value={stakingStats?.gardenerPassCount}
                    size="sm"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="garden-pass"
                  {...fadeAnimation}
                  className="flex gap-6"
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
        <div
          className={`flex flex-col ${stakeType === StakeType.GARDEN_PASS ? "gap-4 sm:gap-10" : "gap-4"}`}
        >
          {stakeType === StakeType.GARDEN_PASS ? (
            <motion.div
              className="grid grid-cols-2 gap-3"
              key="garden-pass-details"
              {...fadeAnimation}
            >
              <div className="flex w-full flex-col items-start justify-start gap-1 rounded-lg bg-white/50 p-2 py-1 sm:flex-row sm:py-2 md:items-center">
                <GiftBoxIcon className="h-4 !text-rose" />
                <Typography
                  size="h6"
                  breakpoints={{ sm: "h5" }}
                  weight="medium"
                >
                  First access to new features
                </Typography>
              </div>
              <div className="flex w-full flex-col items-start justify-start gap-1 rounded-lg bg-white/50 p-2 py-1 sm:flex-row sm:py-2 md:items-center">
                <DollarChipIcon className="h-4 !text-rose" />
                <Typography
                  size="h6"
                  breakpoints={{ sm: "h5" }}
                  weight="medium"
                >
                  Highest staking yields
                </Typography>
              </div>
              <div className="flex w-full flex-col items-start justify-start gap-1 rounded-lg bg-white/50 p-2 py-1 sm:flex-row sm:py-2 md:items-center">
                <HorizontalSwap className="h-4 !text-rose" />
                <Typography
                  size="h6"
                  breakpoints={{ sm: "h5" }}
                  weight="medium"
                >
                  Tradable
                </Typography>
              </div>
              <div className="flex w-full flex-col items-start justify-start gap-1 rounded-lg bg-white/50 p-2 py-1 sm:flex-row sm:py-2 md:items-center">
                <RaiseHandIcon className="h-4 !text-rose" />
                <Typography
                  size="h6"
                  breakpoints={{ sm: "h5" }}
                  weight="medium"
                >
                  Maximum voting power
                </Typography>
              </div>
            </motion.div>
          ) : (
            <motion.div key="custom-input" {...fadeAnimation}>
              <StakeInput balance={tokenBalance} />
            </motion.div>
          )}
          <Button
            size="lg"
            variant={
              !address ||
              (address &&
                balanceFetched &&
                ((isStakeable && !loading) ||
                  shouldBuySeed ||
                  (address && balanceFetched && tokenBalance === 0)))
                ? "primary"
                : "disabled"
            }
            onClick={
              !address
                ? () => setOpenModal(modalNames.connectWallet)
                : shouldBuySeed
                  ? handleBuySeedClick
                  : handleStakeClick
            }
            loading={loading}
          >
            {!address
              ? "Connect Wallet"
              : !tokenBalance && !balanceFetched
                ? "Stake"
                : shouldBuySeed
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
