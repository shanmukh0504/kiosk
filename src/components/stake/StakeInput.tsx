import { useMemo, useState, useRef, useEffect } from "react";
import { MinusIcon, PlusIcon, Typography } from "@gardenfi/garden-book";
import { stakeStore, StakeType } from "../../store/stakeStore";
import { MIN_STAKE_AMOUNT } from "../../constants/stake";
import NumberFlow, { continuous } from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx/lite";
import { fadeAnimation } from "../../animations/animations";
import { SEED_FOR_MINTING_NFT } from "./constants";
import { Toast } from "../toast/Toast";
import { useToastStore } from "../../store/toastStore";

export const StakeInput = ({ balance }: { balance: number }) => {
  const { stakeType, amount, setAmount } = stakeStore();
  const { hideStaticToast } = useToastStore();

  const [animated] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const stakeableBalance = useMemo(
    () => Math.floor(balance / MIN_STAKE_AMOUNT) * MIN_STAKE_AMOUNT,
    [balance]
  );
  const handleBalanceClick = () => {
    if (!balance || balance === 0 || balance < MIN_STAKE_AMOUNT) return;
    setAmount(stakeableBalance);
  };

  const handleMinusClick = () => {
    const currentAmount = Number(amount) || 0;
    if (currentAmount % MIN_STAKE_AMOUNT === 0) {
      const newAmount = Math.max(currentAmount - MIN_STAKE_AMOUNT, 0);
      setAmount(newAmount);
    } else {
      const newAmount =
        Math.floor(currentAmount / MIN_STAKE_AMOUNT) * MIN_STAKE_AMOUNT;
      setAmount(newAmount);
    }
  };

  const handlePlusClick = () => {
    const currentAmount = Number(amount) || 0;
    if (currentAmount % MIN_STAKE_AMOUNT === 0) {
      const newAmount = currentAmount + MIN_STAKE_AMOUNT;
      setAmount(newAmount);
    } else {
      const newAmount =
        Math.floor(currentAmount / MIN_STAKE_AMOUNT) * MIN_STAKE_AMOUNT +
        MIN_STAKE_AMOUNT;
      setAmount(newAmount);
    }
  };

  useEffect(() => {
    hideStaticToast();

    if (balance) {
      const needsMoreSeed =
        (stakeType === StakeType.CUSTOM && amount > balance) ||
        (stakeType === StakeType.GARDEN_PASS && balance < SEED_FOR_MINTING_NFT);

      if (needsMoreSeed) {
        Toast.needSeed(
          "Don't have SEED tokens?",
          "https://app.garden.finance/?output-chain=arbitrum&output-asset=SEED"
        );
      }
    }
  }, [amount, balance, stakeType, hideStaticToast]);

  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-xl bg-white p-4">
      <div className="flex justify-between">
        <Typography size="h5" weight="medium">
          Stake SEED
        </Typography>
        <Typography
          size="h5"
          weight="medium"
          className={stakeType === StakeType.CUSTOM ? "cursor-pointer" : ""}
          onClick={
            stakeType === StakeType.CUSTOM ? handleBalanceClick : undefined
          }
        >
          {balance ? balance.toFixed(3) : 0} available
        </Typography>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography size={"h2"} weight="medium">
            <AnimatePresence mode="wait">
              {stakeType === StakeType.GARDEN_PASS ? (
                <motion.div key="garden-pass" {...fadeAnimation}>
                  <div className="relative flex w-[200px] md:w-[240px]">
                    <NumberFlow
                      value={1}
                      locales="en-US"
                      style={{ fontKerning: "none" }}
                      format={{
                        useGrouping: false,
                      }}
                      plugins={[continuous]}
                      suffix=" pass "
                      aria-hidden="true"
                      animated={animated}
                      className="w-fit tracking-normal duration-200 ease-in-out"
                      willChange
                    />
                    <span className="!font-normal text-mid-grey">
                      <NumberFlow
                        value={SEED_FOR_MINTING_NFT}
                        locales="en-US"
                        style={{ fontKerning: "none" }}
                        format={{
                          useGrouping: false,
                        }}
                        plugins={[continuous]}
                        prefix="("
                        suffix=" SEED)"
                        aria-hidden="true"
                        animated={animated}
                        className="w-fit tracking-normal duration-200 ease-in-out"
                        willChange
                      />
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="custom"
                  {...fadeAnimation}
                  className="w-[200px] md:w-[240px]"
                >
                  <div className="relative flex w-full items-center">
                    <div
                      className={clsx(
                        "relative flex w-full items-center",
                        isAnimating && "pointer-events-none"
                      )}
                      onClick={(e) => {
                        if (isAnimating) return;
                        e.preventDefault();
                        setTimeout(() => {
                          inputRef.current?.focus();
                        }, 0);
                      }}
                    >
                      <NumberFlow
                        value={amount}
                        locales="en-US"
                        style={{ fontKerning: "none", width: "100%" }}
                        format={{
                          useGrouping: false,
                        }}
                        plugins={[continuous]}
                        aria-hidden="true"
                        animated={animated}
                        onAnimationsStart={() => {
                          setIsAnimating(true);
                        }}
                        onAnimationsFinish={() => {
                          setIsAnimating(false);
                        }}
                        className="w-full text-start font-[inherit] tracking-normal duration-200 ease-in-out"
                        willChange
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Typography>
        </div>
        <AnimatePresence mode="wait">
          {stakeType === StakeType.CUSTOM && (
            <div className="flex gap-3">
              <motion.div
                key="minus"
                initial={{ opacity: 0, x: 40 }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{ opacity: 0, x: 40, transition: { delay: 0.05 } }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 25,
                }}
              >
                <MinusIcon
                  onClick={handleMinusClick}
                  className="cursor-pointer"
                />
              </motion.div>
              <motion.div
                key="plus"
                initial={{ opacity: 0, x: 30 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { delay: 0.05 },
                }}
                exit={{ opacity: 0, x: 40 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
              >
                <PlusIcon
                  onClick={handlePlusClick}
                  className="cursor-pointer"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
