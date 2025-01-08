import { ChangeEvent } from "react";
import { MinusIcon, PlusIcon, Typography } from "@gardenfi/garden-book";
import { stakeStore } from "../../store/stakeStore";
import { useBalances } from "../../hooks/useBalances";

export const StakeInput = () => {
  const { asset, inputAmount, setInputAmount } = stakeStore();
  const balances = useBalances(asset);
  const balance = balances.tokenBalance
    ? balances.tokenBalance.toFixed(3)
    : "0.000";

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputAmount(e.target.value);
  };

  const handleBalanceClick = () => {
    if (!balance || balance === "0.000") {
      return;
    }
    setInputAmount(balance);
  };

  const handleMinusClick = () => {
    const newAmount = Math.max(Number(inputAmount) - 1, 0);
    setInputAmount(newAmount.toString());
  };

  const handlePlusClick = () => {
    const newAmount = Number(inputAmount) + 1;
    setInputAmount(newAmount.toString());
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-xl">
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
          {balance} available
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
          <MinusIcon onClick={handleMinusClick} />
          <PlusIcon onClick={handlePlusClick} />
        </div>
      </div>
    </div>
  );
};
