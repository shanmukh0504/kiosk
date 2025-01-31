import { ChangeEvent, useMemo } from "react";
import { MinusIcon, PlusIcon, Typography } from "@gardenfi/garden-book";
import { stakeStore } from "../../store/stakeStore";
import { MIN_STAKE_AMOUNT } from "../../constants/stake";

export const StakeInput = ({ balance }: { balance: number }) => {
  const { inputAmount, setInputAmount } = stakeStore();

  const stakeableBalance = useMemo(
    () => Math.floor(balance / MIN_STAKE_AMOUNT) * MIN_STAKE_AMOUNT,
    [balance]
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputAmount(e.target.value);
  };

  const handleBalanceClick = () => {
    if (!balance || balance === 0 || balance < MIN_STAKE_AMOUNT) return;

    setInputAmount(stakeableBalance.toString());
  };

  const handleMinusClick = () => {
    if (!inputAmount || Number(inputAmount) === 0) return;

    const currentAmount = Number(inputAmount);
    if (currentAmount % MIN_STAKE_AMOUNT === 0) {
      setInputAmount(Math.max(currentAmount - MIN_STAKE_AMOUNT, 0).toString());
    } else {
      const newAmount =
        Math.floor(currentAmount / MIN_STAKE_AMOUNT) * MIN_STAKE_AMOUNT;
      setInputAmount(newAmount.toString());
    }
  };

  const handlePlusClick = () => {
    if (!balance || balance === 0 || balance < MIN_STAKE_AMOUNT) return;

    const currentAmount = Number(inputAmount);
    if (currentAmount % MIN_STAKE_AMOUNT === 0) {
      setInputAmount(
        Math.min(currentAmount + MIN_STAKE_AMOUNT, stakeableBalance).toString()
      );
    } else {
      const newAmount =
        Math.floor(currentAmount / MIN_STAKE_AMOUNT) * MIN_STAKE_AMOUNT;
      setInputAmount(
        Math.min(newAmount + MIN_STAKE_AMOUNT, stakeableBalance).toString()
      );
    }
  };

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
          {balance.toFixed(3)} available
        </Typography>
      </div>
      <div className="flex justify-between">
        <Typography size={"h2"} weight="bold">
          <input
            className="max-w-[200px] outline-none placeholder:text-mid-grey"
            type="text"
            value={inputAmount}
            placeholder="0"
            onChange={handleInputChange}
          />
        </Typography>
        <div className="flex gap-3">
          <MinusIcon onClick={handleMinusClick} className="cursor-pointer" />
          <PlusIcon onClick={handlePlusClick} className="cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
