import { Button, FeesIcon, Typography } from "@gardenfi/garden-book";
import { FC, useRef, useState, useEffect } from "react";
import {
  StakePositionStatus,
  stakeStore,
  StakingPosition,
} from "../../../store/stakeStore";
import { formatAmount, scrollToTop } from "../../../utils/utils";
import {
  ETH_BLOCKS_PER_DAY,
  SEED_DECIMALS,
  STAKING_CHAIN,
  STAKING_CONFIG,
} from "../constants";
import { getMultiplier } from "../../../utils/stakingUtils";
import { TooltipWrapper } from "../shared/ToolTipWrapper";
import { UnitRewardTooltip } from "../shared/UnitRewardTooltip";
import { motion } from "framer-motion";
import { modalNames, modalStore } from "../../../store/modalStore";
import { menuStore } from "../../../store/menuStore";
import { useEVMWallet } from "../../../hooks/useEVMWallet";
import { useSwitchChain, useWriteContract } from "wagmi";
import { Address, Hex } from "viem";
import { stakeABI } from "../abi/stake";
import { Toast } from "../../toast/Toast";
import { simulateContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "../../../layout/wagmi/config";
import { viewPortStore } from "../../../store/viewPortStore";

type props = {
  index: number;
  stakePos: StakingPosition;
};

export const StakeDetails: FC<props> = ({ index, stakePos }) => {
  const { stakeRewards } = stakeStore();
  const { setOpenModal } = modalStore();
  const { openMenuId, setOpenMenu, closeMenu } = menuStore();
  const { chainId, address } = useEVMWallet();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { isMobile, isSmallTab } = viewPortStore();

  const [hovered, setHovered] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPermaStake = stakePos.isPerma;
  const menuId = `stake-menu-${stakePos.id}`;
  const isMenuOpen = openMenuId === menuId;
  const hasExpired = stakePos.status === StakePositionStatus.expired;
  const isUnstakeable = stakePos.status === StakePositionStatus.expired;

  const stakeReward = formatAmount(
    stakeRewards?.stakewiseRewards?.[stakePos.id]?.accumulatedCBBTCRewardsUSD ||
      0,
    8,
    8
  );
  const stakeAmount = formatAmount(stakePos.amount, SEED_DECIMALS, 0);
  const seedReward = formatAmount(
    stakeRewards?.stakewiseRewards?.[stakePos.id]?.accumulatedSeedRewardsUSD ??
      "0",
    SEED_DECIMALS,
    5
  );
  const formattedAmount = stakeAmount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const daysPassedSinceStake = Math.floor(
    (new Date().getTime() - new Date(stakePos.stakedAt).getTime()) /
      (1000 * 3600 * 24)
  );
  const expiryInDays = Math.floor(
    (stakePos.expiry - stakePos.lastStakedAtBlock) / ETH_BLOCKS_PER_DAY
  );
  const stakeEndDate = new Date();
  stakeEndDate.setDate(
    stakeEndDate.getDate() + (expiryInDays - daysPassedSinceStake)
  );
  const stakeEndDateString = isPermaStake ? (
    <Typography size="h4" weight="regular">
      -
    </Typography>
  ) : (
    stakeEndDate.toISOString().split("T")[0].replaceAll("-", "/")
  );

  const multiplier = getMultiplier(stakePos);
  const reward = formatAmount(
    stakeRewards?.stakewiseRewards[stakePos.id]?.accumulatedRewardsUSD || 0,
    0,
    2
  );

  const handleRestake = () => {
    setOpenModal(modalNames.manageStake, {
      restake: {
        isRestake: true,
        stakingPosition: stakePos,
      },
    });
  };

  const handleUnstake = async () => {
    if (!isUnstakeable || !chainId || !address) return;
    try {
      if (chainId !== STAKING_CHAIN) {
        await switchChainAsync({ chainId: STAKING_CHAIN });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const stakingConfig = STAKING_CONFIG[STAKING_CHAIN];

      const { request } = await simulateContract(config, {
        abi: stakeABI,
        address: stakingConfig.STAKING_CONTRACT_ADDRESS as Hex,
        functionName: "refund",
        args: [stakePos.id as Hex],
        account: address as Address,
        chainId: STAKING_CHAIN,
      });

      const tx = await writeContractAsync(request);
      await waitForTransactionReceipt(config, {
        hash: tx,
      });
      Toast.success("Unstaked successfully");
      scrollToTop();
    } catch (error) {
      console.error("Error during unstake:", error);
    }
  };

  const handleExtend = () => {
    setOpenModal(modalNames.manageStake, {
      extend: {
        isExtend: true,
        stakingPosition: stakePos,
      },
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (hovered && targetRef.current && !targetRef.current.contains(target)) {
        setHovered(false);
      }
      // Don't close the menu if clicking inside the tooltip content
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(target)) {
        // Check if the click is on a button inside the tooltip
        const isButtonClick = (target as Element)?.closest("button");
        if (!isButtonClick) {
          closeMenu();
        }
      }
    };
    if (hovered || isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hovered, isMenuOpen, closeMenu]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <motion.tr
      initial={{ opacity: 0, y: -30 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.2,
          delay: 0.1 * index,
          opacity: { delay: 0.1 * index },
        },
      }}
      exit={{
        opacity: 0,
        y: -10,
        transition: { duration: 0.1 },
      }}
      className="origin-top"
    >
      <td className="py-3 pr-2 text-left">
        <Typography
          size="h4"
          weight="regular"
          className="flex items-center gap-1"
        >
          {formattedAmount}
          {stakePos.isGardenerPass && <FeesIcon className="h-4" />}
        </Typography>
      </td>
      <td className="px-4 py-3 text-left sm:px-2">
        {hasExpired ? (
          <Typography size="h4" weight="regular">
            Expired
          </Typography>
        ) : (
          <div className="flex items-center text-nowrap">
            {isPermaStake ? (
              <>
                <Typography size="h4" weight="regular">
                  ∞ months
                </Typography>
              </>
            ) : (
              <Typography
                size="h4"
                weight="regular"
                className="flex items-center"
              >
                {daysPassedSinceStake} / {expiryInDays} days
              </Typography>
            )}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-left sm:px-2 sm:pl-2">
        <Typography size="h4" weight="regular">
          {stakePos.votes}
        </Typography>
      </td>
      <td className="px-4 py-3 text-left sm:px-2">
        <Typography size="h4" weight="regular">
          {multiplier}x
        </Typography>
      </td>
      <td className="px-4 py-3 text-left sm:px-2">
        <span
          ref={targetRef}
          className="inline-block cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {hovered && (!!seedReward || !!stakeReward) && (
            <TooltipWrapper
              offsetX={isMobile || isSmallTab ? 5 : 10}
              offsetY={isMobile || isSmallTab ? 20 : 9}
              targetRef={targetRef}
            >
              <UnitRewardTooltip seed={seedReward} cbBtc={stakeReward} />
            </TooltipWrapper>
          )}
          <Typography size="h4" weight="regular">
            ${reward}
          </Typography>
        </span>
      </td>
      <td className="pr-8 pt-3 text-left sm:pr-0 sm:pt-0">
        <div
          className={`flex w-full max-w-24 items-center overflow-hidden ${hasExpired ? "justify-center rounded-lg" : "justify-start"}`}
        >
          {hasExpired ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleRestake}
              className="w-fit border border-green-500 !px-5"
            >
              Restake
            </Button>
          ) : (
            <Typography size="h4" weight="regular">
              {stakeEndDateString}
            </Typography>
          )}
        </div>
      </td>
      {!isPermaStake && (
        <td
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (clickTimeoutRef.current) {
              clearTimeout(clickTimeoutRef.current);
              clickTimeoutRef.current = null;
            }
            if (isMenuOpen) {
              closeMenu();
            } else {
              setOpenMenu(menuId);
            }
            clickTimeoutRef.current = setTimeout(() => {
              clickTimeoutRef.current = null;
            }, 150);
          }}
          className="mx-1 w-4 cursor-pointer p-1"
        >
          <div className="relative">
            <span ref={menuRef} className="inline-block cursor-pointer">
              <motion.svg
                animate={{
                  scale: isMenuOpen ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 0.15,
                }}
                width="4"
                height="14"
                viewBox="0 0 4 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 13.0588C1.65625 13.0588 1.36201 12.9363 1.11729 12.6915C0.872431 12.4468 0.75 12.1525 0.75 11.8088C0.75 11.465 0.872431 11.1707 1.11729 10.9259C1.36201 10.6811 1.65625 10.5588 2 10.5588C2.34375 10.5588 2.63799 10.6811 2.88271 10.9259C3.12757 11.1707 3.25 11.465 3.25 11.8088C3.25 12.1525 3.12757 12.4468 2.88271 12.6915C2.63799 12.9363 2.34375 13.0588 2 13.0588ZM2 8.25107C1.65625 8.25107 1.36201 8.12864 1.11729 7.88378C0.872431 7.63905 0.75 7.34482 0.75 7.00107C0.75 6.65732 0.872431 6.36308 1.11729 6.11836C1.36201 5.8735 1.65625 5.75107 2 5.75107C2.34375 5.75107 2.63799 5.8735 2.88271 6.11836C3.12757 6.36308 3.25 6.65732 3.25 7.00107C3.25 7.34482 3.12757 7.63905 2.88271 7.88378C2.63799 8.12864 2.34375 8.25107 2 8.25107ZM2 3.44336C1.65625 3.44336 1.36201 3.321 1.11729 3.07628C0.872431 2.83142 0.75 2.53711 0.75 2.19336C0.75 1.84961 0.872431 1.55537 1.11729 1.31065C1.36201 1.06579 1.65625 0.943359 2 0.943359C2.34375 0.943359 2.63799 1.06579 2.88271 1.31065C3.12757 1.55537 3.25 1.84961 3.25 2.19336C3.25 2.53711 3.12757 2.83142 2.88271 3.07628C2.63799 3.321 2.34375 3.44336 2 3.44336Z"
                  fill="#554B6A"
                />
              </motion.svg>
            </span>
            {isMenuOpen && (
              <TooltipWrapper
                targetRef={menuRef}
                offsetX={isMobile || isSmallTab ? 7 : -115}
                offsetY={isMobile || isSmallTab ? 18 : -20}
              >
                <div className="flex flex-col gap-2">
                  {hasExpired && !isPermaStake ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnstake();
                        closeMenu();
                      }}
                      className="z-[9999] !bg-white !text-dark-grey"
                    >
                      Unstake
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExtend();
                        closeMenu();
                      }}
                      className="!bg-white !text-dark-grey"
                    >
                      Extend
                    </Button>
                  )}
                </div>
              </TooltipWrapper>
            )}
          </div>
        </td>
      )}
    </motion.tr>
  );
};
