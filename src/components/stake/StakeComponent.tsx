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
import { BlockchainType, ChainAsset } from "@gardenfi/orderbook";
// import { Switch } from "../../common/Switch";
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
import { network } from "../../constants/constants";
import { Network } from "@gardenfi/utils";
import { viewPortStore } from "../../store/viewPortStore";

export const StakeComponent: React.FC = () => {
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
    // setStakeType,
  } = stakeStore();
  const { loading } = useStake();
  const { hideStaticToast } = useToastStore();
  const { balances, balanceFetched } = balanceStore();
  const tooltipId = useId();
  const { isMobile } = viewPortStore();

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
    // if (stakeType === StakeType.CUSTOM) {
    setOpenModal(modalNames.manageStake, {
      stake: {
        isStake: true,
        amount:
          stakeType === StakeType.CUSTOM
            ? amount.toString()
            : SEED_FOR_MINTING_NFT.toString(),
      },
    });
    // } else {
    //   handleStake(Number(SEED_FOR_MINTING_NFT), true, "INFINITE");
    // }
  };

  const handleBuySeedClick = () => {
    window.open(
      network === Network.MAINNET
        ? "https://app.uniswap.org/explore/tokens/arbitrum/0x86f65121804d2cdbef79f9f072d4e0c2eebabc08"
        : "http://testnet.garden.finance/bridge/arbitrum_sepolia?input-chain=bitcoin_testnet&input-asset=BTC&output-asset=SEED",
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
    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, [
    fetchAndSetStakeApy,
    address,
    fetchStakePosData,
    clearStakePosData,
    fetchAndSetRewards,
  ]);

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
          network === Network.MAINNET
            ? "https://app.uniswap.org/explore/tokens/arbitrum/0x86f65121804d2cdbef79f9f072d4e0c2eebabc08"
            : "http://testnet.garden.finance/bridge/arbitrum_sepolia?input-chain=bitcoin_testnet&input-asset=BTC&output-asset=SEED"
        );
      }
    }
  }, [amount, tokenBalance, stakeType, hideStaticToast]);

  const delays = [0.15, 0.3, 0.4, 0.55, 0.7];

  return (
    <div
      className={`relative z-10 flex w-full min-w-[328px] max-w-[328px] flex-col p-4 sm:min-w-[460px] sm:max-w-[460px] sm:pb-5 ${stakeType === StakeType.GARDEN_PASS ? "gap-10 sm:gap-6" : "gap-8"}`}
      data-testid="stake"
    >
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isMobile ? 372 : 360 }}
        transition={{
          type: "spring" as const,
          stiffness: 100,
          damping: 15,
        }}
        className="absolute inset-0 -z-10 min-w-[328px] max-w-[328px] rounded-2xl bg-white bg-opacity-50 backdrop-blur-2xl sm:min-w-[460px] sm:max-w-[460px]"
      ></motion.div>
      <div className="flex flex-col gap-2">
        <motion.div
          initial={{ opacity: 0, y: -14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring" as const,
            stiffness: 150,
            damping: 15,
            delay: delays[0],
          }}
          className="flex w-full items-center justify-between"
          data-testid="stake-header"
        >
          <Typography
            size="h5"
            breakpoints={{ sm: "h4" }}
            weight="medium"
            data-testid="stake-title"
          >
            Stake
          </Typography>
          {/* <Switch<StakeType>
            options={[
              { label: "Garden pass", value: StakeType.GARDEN_PASS },
              { label: "Custom", value: StakeType.CUSTOM, default: true },
            ]}
            value={stakeType}
            onChange={setStakeType}
          /> */}
        </motion.div>
        <div className="flex flex-col">
          <Typography
            size="h4"
            breakpoints={{ sm: "h4" }}
            weight="regular"
            className={`mb-8 ${stakeType === StakeType.CUSTOM ? "max-h-[60px] min-h-[60px] sm:max-h-10 sm:min-h-10" : "max-h-12 min-h-12 sm:max-h-10 sm:min-h-10"}`}
            data-testid="stake-description"
          >
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: -25, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring" as const,
                  stiffness: 150,
                  damping: 15,
                  delay: delays[1],
                }}
                data-testid={
                  stakeType === StakeType.CUSTOM
                    ? "stake-description-custom"
                    : "stake-description-garden-pass"
                }
              >
                {stakeType === StakeType.CUSTOM ? (
                  <motion.span key="custom" {...fadeAnimation}>
                    Deposit SEED into Garden and unlock new opportunities. Stake
                    multiples of{" "}
                    <Typography className="!text-rose" weight="medium">
                      2,100 SEED
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
                    <span className="!font-[570] text-rose">21,000 SEED</span>{" "}
                    to unlock a{" "}
                    <span className="hidden md:visible md:inline-flex">
                      Gardener Pass.
                    </span>{" "}
                    <span
                      // onClick={() => {
                      //   setIsNftOpen(true);
                      // }}
                      className="inline-flex cursor-pointer items-center justify-start gap-1 text-rose md:hidden"
                    >
                      Gardener Pass.
                      <ArrowNorthEastIcon className="h-3 w-3 p-0.5" />
                    </span>{" "}
                    <br /> Max staking yield, full voting power.
                    <br />{" "}
                  </motion.span>
                )}
              </motion.div>
            </AnimatePresence>
          </Typography>
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring" as const,
              stiffness: 150,
              damping: 15,
              delay: delays[2],
            }}
            className={`flex gap-6 pl-1`}
            data-testid="stake-stats"
          >
            <StakeStats
              title={
                <div className="flex items-center gap-1">
                  APY
                  <div
                    data-tooltip-id={tooltipId}
                    className="cursor-pointer"
                    data-testid="stake-apy-tooltip"
                  >
                    <InfoIcon className="h-3 w-3 p-[0.5px]" />
                  </div>
                </div>
              }
              value={`${stakingStats?.globalApy || 0}%`}
              size="sm"
            />
            <AnimatePresence mode="wait">
              {stakeType === StakeType.GARDEN_PASS ? (
                <motion.div
                  key="custom"
                  {...fadeAnimation}
                  className="flex gap-6"
                  data-testid="stake-stats-garden-pass"
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
                  data-testid="stake-stats-custom"
                >
                  <StakeStats
                    title={"SEED locked"}
                    value={`${stakingStats?.seedLockedPercentage || 0}%`}
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
          </motion.div>
        </div>
      </div>
      <div>
        <div
          className={`flex flex-col ${stakeType === StakeType.GARDEN_PASS ? "gap-4 sm:gap-10" : "gap-4"}`}
          data-testid="stake-body"
        >
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring" as const,
              stiffness: 150,
              damping: 15,
              delay: delays[3],
            }}
          >
            {stakeType === StakeType.GARDEN_PASS ? (
              <motion.div
                className="grid grid-cols-2 gap-3"
                data-testid="stake-garden-pass-benefits"
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
              <motion.div
                key="custom-input"
                data-testid="stake-custom-input"
                {...fadeAnimation}
              >
                <StakeInput balance={tokenBalance} />
              </motion.div>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring" as const,
              stiffness: 150,
              damping: 15,
              delay: delays[4],
            }}
            className="w-full"
          >
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
              data-testid={
                !address
                  ? "stake-cta-connect"
                  : shouldBuySeed
                    ? "stake-cta-buy-seed"
                    : "stake-cta-stake"
              }
              onClick={
                !address
                  ? () =>
                      setOpenModal(modalNames.connectWallet, {
                        [BlockchainType.evm]: true,
                      })
                  : shouldBuySeed
                    ? handleBuySeedClick
                    : handleStakeClick
              }
              loading={loading}
              className="w-full"
            >
              {!address
                ? "Connect EVM Wallet"
                : !tokenBalance && !balanceFetched
                  ? "Stake"
                  : shouldBuySeed
                    ? "Buy SEED"
                    : stakeType === StakeType.GARDEN_PASS
                      ? "Buy Garden Pass"
                      : "Stake"}
            </Button>
          </motion.div>
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
