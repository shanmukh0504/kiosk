import { Button, Typography } from "@gardenfi/garden-book";
import { stakeStore } from "../../store/stakeStore";
import { SEED_DECIMALS, TEN_THOUSAND } from "../../constants/stake";
import { distributerABI } from "./abi/distributerClaim";
import { useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { useState, useMemo } from "react";
import { useEVMWallet } from "../../hooks/useEVMWallet";
import { Hex } from "viem";
import { formatAmount } from "../../utils/utils";
import { REWARD_CHAIN, REWARD_CONFIG } from "./constants";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../../layout/wagmi/config";
import { Toast } from "../toast/Toast";
import { AnimatePresence, motion } from "framer-motion";
import { TooltipWrapper } from "./shared/ToolTipWrapper";
import { OverviewStats } from "./shared/OverviewStats";

export const StakeOverview = () => {
  const [isClaimLoading, setIsClaimLoading] = useState(false);

  const { totalStakedAmount, totalVotes, stakeRewards } = stakeStore();
  const { writeContractAsync } = useWriteContract();
  const { address, chainId } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
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

  const availableReward = useMemo(() => {
    return stakeRewards
      ? formatAmount(
          stakeRewards.totalcbBtcReward - Number(claimedAmount ?? 0),
          8,
          5
        )
      : 0;
  }, [stakeRewards, claimedAmount]);

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
      <div className="mx-auto flex w-[328px] flex-col gap-[20px] rounded-[15px] bg-white p-6 sm:w-[424px] md:w-[740px] lg:w-[1000px]">
        <Typography size="h5" weight="bold">
          Staking overview
        </Typography>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex w-full flex-col gap-[32.67px] sm:w-[384px] sm:flex-row md:w-[600px] md:gap-[20px]">
            <div className="flex gap-4 sm:gap-8 md:gap-5">
              <OverviewStats
                title={"Staked SEED"}
                value={formattedAmount}
                size="sm"
                className="w-[120px] sm:w-fit md:w-[120px]"
              />
              <OverviewStats
                title={"Votes"}
                value={totalVotes !== undefined ? totalVotes : 0}
                size="sm"
                className="w-[120px] sm:w-fit md:w-[80px] xl:w-[120px]"
              />
            </div>
            <div className="flex gap-4 sm:gap-8 md:gap-5">
              <AnimatePresence>
                <OverviewStats
                  title={"Total rewards"}
                  value={`~$${stakeRewards?.accumulatedRewardUSD.toFixed(2) || 0}`}
                  size="sm"
                  toolTip={
                    <TooltipWrapper
                      seedReward={formatAmount(
                        stakeRewards?.totalSeedReward ?? 0,
                        SEED_DECIMALS,
                        5
                      )}
                      cbBtcReward={formatAmount(
                        Number(
                          stakeRewards?.rewardResponse.cumulative_rewards_cbbtc
                        ),
                        8,
                        5
                      )}
                    />
                  }
                  className="w-[120px] cursor-pointer sm:w-fit md:mr-5 md:w-[100px]"
                />
              </AnimatePresence>
              <OverviewStats
                title={"Staking rewards"}
                value={`${availableReward || 0} cbBTC`}
                size="sm"
                isPink
              />
            </div>
          </div>
          <Button
            variant={
              isClaimLoading || availableReward === 0 ? "disabled" : "primary"
            }
            size="sm"
            className={`w-full md:w-[120px] ${
              isClaimLoading || !availableReward
                ? "flex items-center justify-center self-center transition-colors duration-500"
                : ""
            }`}
            onClick={handleRewardClick}
            disabled={isClaimLoading || !availableReward}
            loading={isClaimLoading}
          >
            {isClaimLoading ? "Claiming..." : "Claim"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
