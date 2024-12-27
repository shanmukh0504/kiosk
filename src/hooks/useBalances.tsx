import { useEffect, useMemo } from "react";
import { swapStore } from "../store/swapStore";
import { isBitcoin } from "@gardenfi/orderbook";
import { evmToViemChainMap } from "@gardenfi/core";
import { useEVMWallet } from "./useEVMWallet";
import { getTokenBalance } from "../utils/getTokenBalance";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import BigNumber from "bignumber.js";
import { balanceStore } from "../store/balanceStore";

export const useBalances = () => {
  const { balances, setBalance, clearBalances } = balanceStore();
  const { address } = useEVMWallet();
  const { provider } = useBitcoinWallet();
  const { inputAsset } = swapStore();

  const inputToken = inputAsset;

  const inputTokenBalance = useMemo(
    () =>
      balances[
        `${inputToken?.chain}_${inputToken?.tokenAddress.toLowerCase()}`
      ],
    [balances, inputToken]
  );

  useEffect(() => {
    if (!inputAsset) return;

    const fetchBalance = async () => {
      if (isBitcoin(inputAsset.chain)) {
        if (!provider) return;
        const balance = await provider.getBalance();
        if (balance.error || !balance.val) return;

        const bal = new BigNumber(balance.val.total)
          .dividedBy(10 ** inputAsset.decimals)
          .toNumber();
        setBalance(inputAsset, bal);
      } else {
        if (!address) {
          clearBalances();
          return;
        }
        const chain = evmToViemChainMap[inputAsset.chain];
        if (!chain) return;
        const balance = await getTokenBalance(address, inputAsset);
        setBalance(inputAsset, balance);
      }
    };

    fetchBalance();
    const intervalId = setInterval(fetchBalance, 10000);

    return () => clearInterval(intervalId);
  }, [address, clearBalances, inputAsset, provider, setBalance]);

  return { balances, inputTokenBalance };
};
