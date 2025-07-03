import React, { useMemo, useState, useRef, useEffect } from "react";
import { MinusIcon, PlusIcon, Typography } from "@gardenfi/garden-book";
import { stakeStore, StakeType } from "../../store/stakeStore";
import { MIN_STAKE_AMOUNT } from "../../constants/stake";
import NumberFlow, { continuous } from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx/lite";
import { fadeAnimation } from "../../animations/animations";
import { SEED_FOR_MINTING_NFT } from "./constants";

export const StakeInput = ({ balance }: { balance: number }) => {
  const { stakeType, inputAmount, setInputAmount } = stakeStore();
  const [passCount, setPassCount] = useState(1);
  const [passSeed, setPassSeed] = useState(SEED_FOR_MINTING_NFT);
  const [customSeed, setCustomSeed] = useState(0);
  const [customInputAmount, setCustomInputAmount] = useState("0");
  const [animated] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const stakeableBalance = useMemo(
    () => Math.floor(balance / MIN_STAKE_AMOUNT) * MIN_STAKE_AMOUNT,
    [balance]
  );

  const handleBalanceClick = () => {
    if (!balance || balance === 0 || balance < MIN_STAKE_AMOUNT) return;

    if (stakeType === StakeType.GARDEN_PASS) {
      const maxPasses = Math.floor(balance / SEED_FOR_MINTING_NFT);
      setPassCount(maxPasses);
      const newPassSeed = maxPasses * SEED_FOR_MINTING_NFT;
      setPassSeed(newPassSeed);
      setInputAmount(newPassSeed.toString());
    } else {
      setCustomSeed(stakeableBalance);
      setCustomInputAmount(stakeableBalance.toString());
      setInputAmount(stakeableBalance.toString());
    }
  };

  const roundToNearestMultiple = (value: number) => {
    const rounded = Math.round(value / MIN_STAKE_AMOUNT) * MIN_STAKE_AMOUNT;
    if (balance && rounded > balance) {
      return Math.floor(balance / MIN_STAKE_AMOUNT) * MIN_STAKE_AMOUNT;
    }
    return rounded;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    if (!/^[0-9]*\.?[0-9]*$/.test(input)) {
      return;
    }

    if (input.startsWith(".")) {
      input = "0" + input;
    }

    const parts = input.split(".");
    if (input === "-") return;

    if (parts.length > 2) {
      return;
    }

    setCustomInputAmount(input);
    const numValue = Number(input) || 0;
    setCustomSeed(numValue);
    setInputAmount(input);
  };

  const handleInputBlur = () => {
    if (stakeType === StakeType.CUSTOM) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const currentValue = Number(customInputAmount) || 0;
        const roundedValue = roundToNearestMultiple(currentValue);
        setCustomInputAmount(roundedValue.toString());
        setCustomSeed(roundedValue);
        setInputAmount(roundedValue.toString());
      }, 500);
    }
    setIsFocused(false);
  };

  const handleMinusClick = () => {
    if (stakeType === StakeType.GARDEN_PASS) {
      if (passCount > 1) {
        const newPassCount = passCount - 1;
        setPassCount(newPassCount);
        const newPassSeed = newPassCount * SEED_FOR_MINTING_NFT;
        setPassSeed(newPassSeed);
        setInputAmount(newPassSeed.toString());
      }
    } else {
      const currentAmount = Number(customInputAmount) || 0;
      if (currentAmount % MIN_STAKE_AMOUNT === 0) {
        const newAmount = Math.max(currentAmount - MIN_STAKE_AMOUNT, 0);
        setCustomSeed(newAmount);
        setCustomInputAmount(newAmount.toString());
        setInputAmount(newAmount.toString());
      } else {
        const newAmount =
          Math.floor(currentAmount / MIN_STAKE_AMOUNT) * MIN_STAKE_AMOUNT;
        setCustomSeed(newAmount);
        setCustomInputAmount(newAmount.toString());
        setInputAmount(newAmount.toString());
      }
    }
  };

  const handlePlusClick = () => {
    if (stakeType === StakeType.GARDEN_PASS) {
      const newPassCount = passCount + 1;
      setPassCount(newPassCount);
      const newPassSeed = newPassCount * SEED_FOR_MINTING_NFT;
      setPassSeed(newPassSeed);
      setInputAmount(newPassSeed.toString());
    } else {
      const currentAmount = Number(customInputAmount) || 0;
      if (currentAmount % MIN_STAKE_AMOUNT === 0) {
        const newAmount = currentAmount + MIN_STAKE_AMOUNT;
        setCustomSeed(newAmount);
        setCustomInputAmount(newAmount.toString());
        setInputAmount(newAmount.toString());
      } else {
        const newAmount =
          Math.floor(currentAmount / MIN_STAKE_AMOUNT) * MIN_STAKE_AMOUNT +
          MIN_STAKE_AMOUNT;
        setCustomSeed(newAmount);
        setCustomInputAmount(newAmount.toString());
        setInputAmount(newAmount.toString());
      }
    }
  };

  useEffect(() => {
    if (Number(inputAmount) === 0) {
      setCustomInputAmount("0");
      setCustomSeed(0);
    }
  }, [inputAmount, setCustomInputAmount, setCustomSeed]);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4">
      <div className="flex justify-between">
        <Typography size="h5" weight="bold">
          Stake SEED
        </Typography>
        <Typography
          size="h5"
          weight="bold"
          className="cursor-pointer"
          onClick={handleBalanceClick}
        >
          {balance && balance.toFixed(3)} available
        </Typography>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography size={"h2"} weight="bold">
            <AnimatePresence mode="wait">
              {stakeType === StakeType.GARDEN_PASS ? (
                <motion.div key="garden-pass" {...fadeAnimation}>
                  <div className="relative flex w-[240px]">
                    <NumberFlow
                      value={passCount}
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
                    <span className="!font-medium text-mid-grey">
                      <NumberFlow
                        value={passSeed}
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
                  className="w-[240px]"
                >
                  <div className="relative flex w-full items-center">
                    <div
                      className={clsx(
                        "relative flex w-full items-center",
                        !isAnimating && "cursor-text",
                        isAnimating && "pointer-events-none"
                      )}
                      onClick={(e) => {
                        if (isAnimating) return;
                        e.preventDefault();
                        setIsFocused(true);
                        if (customInputAmount === "0") setCustomInputAmount("");
                        setTimeout(() => {
                          inputRef.current?.focus();
                        }, 0);
                      }}
                    >
                      {isFocused ? (
                        <input
                          ref={inputRef}
                          className={clsx(
                            "w-full bg-transparent py-[1px] text-start font-[inherit] outline-none",
                            isAnimating && "pointer-events-none"
                          )}
                          style={{ fontKerning: "none" }}
                          type="tel"
                          value={customInputAmount}
                          onChange={handleInputChange}
                          onFocus={() => setIsFocused(true)}
                          onBlur={handleInputBlur}
                        />
                      ) : (
                        <NumberFlow
                          value={customSeed}
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
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Typography>
        </div>
        <div className="flex gap-3">
          <MinusIcon onClick={handleMinusClick} className="cursor-pointer" />
          <PlusIcon onClick={handlePlusClick} className="cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
