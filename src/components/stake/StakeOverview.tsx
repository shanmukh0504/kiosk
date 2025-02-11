import { Button, Typography } from "@gardenfi/garden-book";
import { stakeStore } from "../../store/stakeStore";
import { TEN_THOUSAND } from "../../constants/stake";
import { distributerABI } from "./abi/distributerClaim";
import { useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { useState, useMemo } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Hex } from "viem";
import { StakeStats } from "./shared/StakeStats";
import { formatAmount } from "../../utils/utils";
import { REWARD_CHAIN, REWARD_CONFIG } from "./constants";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../../layout/wagmi/config";
import { Toast } from "../toast/Toast";
import { AnimatePresence, motion } from "framer-motion";
import { viewPortStore } from "../../store/viewPortStore";
import { RewardsToolTip } from "./shared/RewardsToolTip";

export const StakeOverview = () => {
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const {
    totalStakedAmount,
    totalVotes,
    stakeRewards,
    totalSeedReward,
    seedPriceUSD,
  } = stakeStore();
  const { writeContractAsync } = useWriteContract();
  const { address, chainId } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
  const { isTab } = viewPortStore();
  // get claimed amount
  const { data: claimedAmount, refetch: refetchClaimedAmount } =
    useReadContract({
      abi: distributerABI,
      functionName: "getClaimedAmount",
      address: REWARD_CONFIG[REWARD_CHAIN].DISTRIBUTER_CONTRACT as Hex,
      args: [address as Hex],
      chainId: REWARD_CHAIN,
      query: {
        enabled: !!address,
        refetchInterval: 15_000,
      },
    });

  const formattedAmount =
    totalStakedAmount === undefined
      ? "0"
      : totalStakedAmount >= TEN_THOUSAND
        ? totalStakedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        : totalStakedAmount.toString();
  const totalRewardsInUSD =
    totalSeedReward * seedPriceUSD +
    (stakeRewards?.rewardResponse?.cumulative_rewards_usd
      ? parseFloat(stakeRewards.rewardResponse.cumulative_rewards_usd)
      : 0);

  const availableReward = useMemo(() => {
    return stakeRewards
      ? formatAmount(
          stakeRewards.rewardResponse.cumulative_rewards_cbbtc -
            Number(claimedAmount ?? 0),
          8,
          5
        )
      : 0;
  }, [stakeRewards, claimedAmount]);

  const cbBtcRewardCumulative = stakeRewards
    ? formatAmount(stakeRewards.rewardResponse.cumulative_rewards_cbbtc, 8, 5)
    : 0;

  const handleRewardClick = async () => {
    if (!chainId || !address || !stakeRewards) return;
    const rewardConfig = REWARD_CONFIG[REWARD_CHAIN];
    if (!rewardConfig) return;

    try {
      setIsClaimLoading(true);
      if (chainId !== REWARD_CHAIN) {
        await switchChainAsync({ chainId: REWARD_CHAIN });
        //small workaround to make sure the chain is switched other wise the claim is failing
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const tx = await writeContractAsync({
        abi: distributerABI,
        functionName: "claim",
        address: rewardConfig.DISTRIBUTER_CONTRACT as Hex,
        args: [
          address as Hex,
          BigInt(stakeRewards.rewardResponse.cumulative_rewards_cbbtc),
          BigInt(stakeRewards.rewardResponse.nonce),
          ("0x" + stakeRewards.rewardResponse.latest_claim_signature) as Hex,
        ],
        chainId: REWARD_CHAIN,
      });
      await waitForTransactionReceipt(config, {
        hash: tx,
      });
      await refetchClaimedAmount();
      Toast.success("Withdrawal completed successfully");
    } catch (error) {
      console.error("Error claiming rewards:", error);
    } finally {
      setIsClaimLoading(false);
    }
  };

  return (
    <motion.div
      animate={{
        scale: ["80%", "100%"],
        margin: ["-10%", "0%"],
        opacity: ["0%", "100%"],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
          once: true,
          opacity: {
            duration: 0.3,
            delay: 0.4,
          },
        },
      }}
      style={{ transformOrigin: "top" }}
    >
      <div className="mx-auto flex w-[328px] flex-col gap-4 rounded-[15px] bg-white p-6 sm:w-[424px] md:w-[740px] lg:w-[1000px]">
        <Typography size="h5" weight="bold">
          Staking overview
        </Typography>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex w-full justify-between gap-10 md:w-[500px]">
            <StakeStats
              title={"Staked SEED"}
              value={formattedAmount}
              size="sm"
            />
            <StakeStats
              title={"Votes"}
              value={totalVotes !== undefined ? totalVotes : 0}
              size="sm"
            />
            {isTab && (
              <AnimatePresence>
                <div
                  className="relative cursor-pointer"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <StakeStats
                    title={"Total rewards"}
                    value={`~$${totalRewardsInUSD.toFixed(2)}`}
                    size="sm"
                  />
                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="absolute top-12 z-50 mx-auto flex w-max flex-col sm:absolute sm:left-[calc(100%+15px)] sm:top-[8.5px] sm:-translate-x-1/2 sm:flex-col-reverse"
                      >
                        <RewardsToolTip
                          seed={totalSeedReward}
                          cbBtc={cbBtcRewardCumulative}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatePresence>
            )}

            <StakeStats
              title={"Staking rewards"}
              value={`${availableReward} cbBTC`}
              size="sm"
              isPink
            />
          </div>
          <Button
            variant={
              isClaimLoading || availableReward === 0 ? "disabled" : "primary"
            }
            size="sm"
            className={`w-full md:w-[120px] ${
              isClaimLoading || availableReward === 0
                ? "flex items-center justify-center self-center transition-colors duration-500"
                : ""
            }`}
            onClick={handleRewardClick}
            disabled={isClaimLoading || availableReward === 0}
            loading={isClaimLoading}
          >
            {isClaimLoading ? "Claiming..." : "Claim"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
